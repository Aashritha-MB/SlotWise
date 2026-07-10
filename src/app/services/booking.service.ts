import { Injectable } from '@angular/core';
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
  runTransaction,
  DocumentReference,
  DocumentData,
  CollectionReference,
  Query,
} from 'firebase/firestore';
import { Observable } from 'rxjs';
import { db } from '../../firebase.config';
import { Booking, BookingPayload } from '../models/booking.model';

/** Firestore collection name for bookings */
const COLLECTION = 'bookings';

@Injectable({ providedIn: 'root' })
export class BookingService {

  private readonly colRef: CollectionReference<DocumentData> =
    collection(db, COLLECTION);

  // ── Read ──────────────────────────────────────────────────────────────────

  /**
   * Returns a real-time stream of **all** bookings across every slot.
   * Automatically unsubscribes from Firestore when the Observable is
   * unsubscribed.
   */
  getAll$(): Observable<Booking[]> {
    return new Observable<Booking[]>((subscriber) => {
      const unsubscribe = onSnapshot(
        this.colRef,
        (snapshot) => {
          const bookings: Booking[] = snapshot.docs.map((docSnap) => ({
            id: docSnap.id,
            ...(docSnap.data() as BookingPayload),
          }));
          subscriber.next(bookings);
        },
        (error) => subscriber.error(error)
      );

      return () => unsubscribe();
    });
  }

  /**
   * Returns a real-time stream of all bookings that belong to a specific slot.
   * Useful for listing bookings on a slot detail page.
   */
  getBySlotId$(slotId: string): Observable<Booking[]> {
    const q: Query<DocumentData> = query(
      this.colRef,
      where('slotId', '==', slotId)
    );

    return new Observable<Booking[]>((subscriber) => {
      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const bookings: Booking[] = snapshot.docs.map((docSnap) => ({
            id: docSnap.id,
            ...(docSnap.data() as BookingPayload),
          }));
          subscriber.next(bookings);
        },
        (error) => subscriber.error(error)
      );

      return () => unsubscribe();
    });
  }

  /**
   * Returns a real-time stream for a **single** booking by its document ID.
   * Emits `null` if the document does not exist.
   */
  getById$(id: string): Observable<Booking | null> {
    const docRef: DocumentReference<DocumentData> = doc(db, COLLECTION, id);

    return new Observable<Booking | null>((subscriber) => {
      const unsubscribe = onSnapshot(
        docRef,
        (docSnap) => {
          if (docSnap.exists()) {
            subscriber.next({
              id: docSnap.id,
              ...(docSnap.data() as BookingPayload),
            });
          } else {
            subscriber.next(null);
          }
        },
        (error) => subscriber.error(error)
      );

      return () => unsubscribe();
    });
  }

  // ── Write ─────────────────────────────────────────────────────────────────

  /**
   * Creates a new booking document.
   * New bookings default to `status: 'pending'` unless explicitly set.
   * @returns The Firestore-generated document ID of the new booking.
   */
  async create(payload: BookingPayload): Promise<string> {
    const docRef = await addDoc(this.colRef, payload);
    return docRef.id;
  }

  /**
   * Partially updates an existing booking.
   * Only the provided fields are merged — unspecified fields are untouched.
   * Commonly used to change `status` (e.g. 'pending' → 'confirmed').
   */
  async update(id: string, payload: Partial<BookingPayload>): Promise<void> {
    const docRef: DocumentReference<DocumentData> = doc(db, COLLECTION, id);
    await updateDoc(docRef, payload as DocumentData);
  }

  /**
   * Permanently deletes a booking document by its ID.
   */
  async delete(id: string): Promise<void> {
    const docRef: DocumentReference<DocumentData> = doc(db, COLLECTION, id);
    await deleteDoc(docRef);
  }

  /**
   * Atomically deletes a booking and decrements the parent slot's booked count.
   *
   * Uses a Firestore Transaction so both operations either succeed together
   * or both fail — the booking list and slot availability never drift apart.
   * The booked count is floored at 0 to prevent it going negative.
   *
   * @param bookingId - Firestore document ID of the booking to delete.
   * @param slotId    - Firestore document ID of the parent slot.
   */
  async deleteWithSlotDecrement(
    bookingId: string,
    slotId:    string,
  ): Promise<void> {
    const bookingRef: DocumentReference<DocumentData> = doc(db, COLLECTION, bookingId);
    const slotRef:    DocumentReference<DocumentData> = doc(db, 'slots',    slotId);

    await runTransaction(db, async (tx) => {
      const slotSnap = await tx.get(slotRef);

      // Determine the current booked count; default to 0 if the slot is gone
      const currentBooked: number =
        slotSnap.exists()
          ? ((slotSnap.data()['booked'] as number) ?? 0)
          : 0;

      // Delete the booking document
      tx.delete(bookingRef);

      // Decrement slot.booked — never below 0
      if (slotSnap.exists()) {
        tx.update(slotRef, { booked: Math.max(0, currentBooked - 1) });
      }
    });
  }
}
