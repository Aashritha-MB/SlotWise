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
}
