import { Component, inject, signal } from '@angular/core';
import { AsyncPipe, Location } from '@angular/common';
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
  private readonly location    = inject(Location);

  goBack(): void { this.location.back(); }

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

  // ── Contact validation ─────────────────────────────────

  /**
   * Strips every non-digit character and caps the value at 10 digits.
   * Called on every (input) event so the model stays sanitized in real time.
   */
  onContactInput(): void {
    this.formContact = this.formContact.replace(/\D/g, '').slice(0, 10);
  }

  /** True only when formContact is exactly 10 digits. */
  get contactValid(): boolean {
    return /^\d{10}$/.test(this.formContact);
  }

  // ── Slot helpers ───────────────────────────────────────

  /**
   * Today's date as a local ISO-8601 date string ("YYYY-MM-DD").
   * Computed once when the component is constructed so every comparison
   * within a single page visit uses the same reference point.
   */
  readonly todayStr: string = (() => {
    const d    = new Date();
    const yyyy = d.getFullYear();
    const mm   = String(d.getMonth() + 1).padStart(2, '0');
    const dd   = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  })();

  /**
   * Returns true when the slot's date+time combination is in the past.
   * - If the slot is on a past date           → always past.
   * - If the slot is today but the time has already passed → past.
   * - If the slot is on a future date          → never past.
   * Time comparison ("HH:MM" strings) is only applied when the date is today.
   */
  isPastDateTime(slot: Slot): boolean {
    if (slot.date < this.todayStr) return true;          // past date
    if (slot.date > this.todayStr) return false;         // future date
    // slot.date === todayStr: compare time
    const now  = new Date();
    const hh   = String(now.getHours()).padStart(2, '0');
    const mi   = String(now.getMinutes()).padStart(2, '0');
    return slot.time <= `${hh}:${mi}`;
  }

  isAvailable(slot: Slot): boolean {
    return slot.booked < slot.capacity;
  }

  seatsLeft(slot: Slot): number {
    return slot.capacity - slot.booked;
  }

  // ── Actions ────────────────────────────────────────────

  selectSlot(slot: Slot): void {
    if (this.isPastDateTime(slot) || !this.isAvailable(slot)) return;
    this.selectedSlot.set(slot);
    this.errorMessage.set('');
  }

  cancelSelection(): void {
    this.selectedSlot.set(null);
    this.formName    = '';
    this.formContact = '';
    this.errorMessage.set('');
  }

  /** Guard called by submitBooking — rejects if contact is not exactly 10 digits. */
  private isFormValid(): boolean {
    return this.formName.trim().length > 0 && this.contactValid;
  }

  async submitBooking(): Promise<void> {
    const slot = this.selectedSlot();
    if (!slot || !this.isFormValid()) return;

    // ── Past date/time backstop ──────────────────────────────────────────
    // Guards against any UI bypass (e.g. DevTools manipulation).
    // Checks both date and time — a slot whose date is today but time
    // has already passed is also blocked here.
    if (this.isPastDateTime(slot)) {
      this.errorMessage.set('Please select a valid future date and time.');
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set('');

    try {
      const slotRef = doc(db, 'slots', slot.id);

      // ── Deterministic booking ID ────────────────────────────────────────
      // Encoding slotId + contact into the document ID means tx.get() can
      // check for a duplicate inside the transaction — making the duplicate
      // guard and the write a single atomic operation. No race condition,
      // no composite index required, no schema change.
      const bookingId  = `${slot.id}__${this.formContact.trim()}`;
      const bookingRef = doc(db, 'bookings', bookingId);

      await runTransaction(db, async (tx) => {
        // ── 1. Check for an existing duplicate booking ──────────────────
        const existingSnap = await tx.get(bookingRef);
        if (existingSnap.exists()) {
          throw new Error('You have already booked this slot.');
        }

        // ── 2. Check slot capacity ──────────────────────────────────────
        const slotSnap = await tx.get(slotRef);
        if (!slotSnap.exists()) {
          throw new Error('This slot no longer exists.');
        }

        const currentBooked = (slotSnap.data()['booked'] as number) ?? 0;
        const capacity      = (slotSnap.data()['capacity'] as number) ?? 0;

        if (currentBooked >= capacity) {
          throw new Error('This slot is no longer available.');
        }

        // ── 3. Write booking + increment booked count atomically ────────
        const payload: BookingPayload = {
          slotId:  slot.id,
          name:    this.formName.trim(),
          contact: this.formContact.trim(),
          status:  'pending',
        };

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
