import { Component, inject, signal } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { runTransaction, doc, collection } from 'firebase/firestore';
import { db } from '../../../firebase.config';
import { SlotService } from '../../services/slot.service';
import { Slot } from '../../models/slot.model';
import { BookingPayload } from '../../models/booking.model';

@Component({
  selector: 'app-book',
  standalone: true,
  imports: [AsyncPipe, FormsModule],
  templateUrl: './book.html',
  styleUrl: './book.css',
})
export class Book {
  private readonly slotService = inject(SlotService);

  /** Real-time stream of all slots — AsyncPipe handles unsubscribe */
  readonly slots$ = this.slotService.getAll$();

  // ── UI state ───────────────────────────────────────────
  selectedSlot    = signal<Slot | null>(null);
  isSubmitting    = signal(false);
  errorMessage    = signal('');
  bookingComplete = signal(false);

  // ── Form model ─────────────────────────────────────────
  formName    = '';
  formContact = '';

  // ── Slot helpers ───────────────────────────────────────

  isAvailable(slot: Slot): boolean {
    return slot.booked < slot.capacity;
  }

  seatsLeft(slot: Slot): number {
    return slot.capacity - slot.booked;
  }

  // ── Actions ────────────────────────────────────────────

  selectSlot(slot: Slot): void {
    if (!this.isAvailable(slot)) return;
    this.selectedSlot.set(slot);
    this.errorMessage.set('');
  }

  cancelSelection(): void {
    this.selectedSlot.set(null);
    this.formName    = '';
    this.formContact = '';
    this.errorMessage.set('');
  }

  async submitBooking(): Promise<void> {
    const slot = this.selectedSlot();
    if (!slot || !this.formName.trim() || !this.formContact.trim()) return;

    this.isSubmitting.set(true);
    this.errorMessage.set('');

    try {
      const slotRef    = doc(db, 'slots', slot.id);
      // Pre-generate a doc ref so the ID is determined before the transaction
      const bookingRef = doc(collection(db, 'bookings'));

      await runTransaction(db, async (tx) => {
        const slotSnap = await tx.get(slotRef);

        if (!slotSnap.exists()) {
          throw new Error('This slot no longer exists.');
        }

        const currentBooked = (slotSnap.data()['booked'] as number) ?? 0;
        const capacity      = (slotSnap.data()['capacity'] as number) ?? 0;

        if (currentBooked >= capacity) {
          throw new Error('This slot is now full. Please choose another slot.');
        }

        const payload: BookingPayload = {
          slotId:  slot.id,
          name:    this.formName.trim(),
          contact: this.formContact.trim(),
          status:  'pending',
        };

        // Write booking + increment booked count atomically
        tx.set(bookingRef, payload);
        tx.update(slotRef, { booked: currentBooked + 1 });
      });

      this.bookingComplete.set(true);
    } catch (err: unknown) {
      this.errorMessage.set(
        err instanceof Error ? err.message : 'Booking failed. Please try again.'
      );
    } finally {
      this.isSubmitting.set(false);
    }
  }

  bookAgain(): void {
    this.bookingComplete.set(false);
    this.selectedSlot.set(null);
    this.formName    = '';
    this.formContact = '';
    this.errorMessage.set('');
  }
}
