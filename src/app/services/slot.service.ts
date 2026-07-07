import { Injectable } from '@angular/core';
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  DocumentReference,
  DocumentData,
  CollectionReference,
} from 'firebase/firestore';
import { Observable } from 'rxjs';
import { db } from '../../firebase.config';
import { Slot, SlotPayload } from '../models/slot.model';

/** Firestore collection name for slots */
const COLLECTION = 'slots';

@Injectable({ providedIn: 'root' })
export class SlotService {

  private readonly colRef: CollectionReference<DocumentData> =
    collection(db, COLLECTION);

  // ── Read ──────────────────────────────────────────────────────────────────

  /**
   * Returns a real-time stream of **all** slots.
   * Automatically unsubscribes from Firestore when the Observable is
   * unsubscribed (e.g. when the consuming component is destroyed).
   */
  getAll$(): Observable<Slot[]> {
    return new Observable<Slot[]>((subscriber) => {
      const unsubscribe = onSnapshot(
        this.colRef,
        (snapshot) => {
          const slots: Slot[] = snapshot.docs.map((docSnap) => ({
            id: docSnap.id,
            ...(docSnap.data() as SlotPayload),
          }));
          subscriber.next(slots);
        },
        (error) => subscriber.error(error)
      );

      // Teardown — called when the Observable is unsubscribed
      return () => unsubscribe();
    });
  }

  /**
   * Returns a real-time stream for a **single** slot by its document ID.
   * Emits `null` if the document does not exist.
   */
  getById$(id: string): Observable<Slot | null> {
    const docRef: DocumentReference<DocumentData> = doc(db, COLLECTION, id);

    return new Observable<Slot | null>((subscriber) => {
      const unsubscribe = onSnapshot(
        docRef,
        (docSnap) => {
          if (docSnap.exists()) {
            subscriber.next({ id: docSnap.id, ...(docSnap.data() as SlotPayload) });
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
   * Creates a new slot document.
   * @returns The Firestore-generated document ID of the new slot.
   */
  async create(payload: SlotPayload): Promise<string> {
    const docRef = await addDoc(this.colRef, payload);
    return docRef.id;
  }

  /**
   * Partially updates an existing slot.
   * Only the provided fields are merged — unspecified fields are untouched.
   */
  async update(id: string, payload: Partial<SlotPayload>): Promise<void> {
    const docRef: DocumentReference<DocumentData> = doc(db, COLLECTION, id);
    await updateDoc(docRef, payload as DocumentData);
  }

  /**
   * Permanently deletes a slot document by its ID.
   */
  async delete(id: string): Promise<void> {
    const docRef: DocumentReference<DocumentData> = doc(db, COLLECTION, id);
    await deleteDoc(docRef);
  }
}
