import { Component, inject, signal } from '@angular/core';
import { AsyncPipe, Location } from '@angular/common';

import { combineLatest, map, Observable } from 'rxjs';
import { BookingService } from '../../services/booking.service';
import { SlotService } from '../../services/slot.service';
import { Booking, BookingStatus } from '../../models/booking.model';
import { Slot } from '../../models/slot.model';

/** A booking enriched with its resolved Slot details. */
export interface BookingRow {
  booking: Booking;
  /** null when the referenced slot has been deleted */
  slot: Slot | null;
}

@Component({
  selector: 'app-bookings',
  standalone: true,
  imports: [AsyncPipe],
  templateUrl: './bookings.html',
  styleUrl: './bookings.css',
})
export class Bookings {
  private readonly bookingService = inject(BookingService);
  private readonly slotService    = inject(SlotService);
  private readonly location       = inject(Location);

  goBack(): void { this.location.back(); }

  /**
   * Combines two real-time Firestore streams into a single enriched list.
   * Uses a Map<slotId, Slot> for O(1) lookup — no extra Firestore reads.
   * Re-emits automatically whenever bookings or slots change.
   */
  readonly rows$: Observable<BookingRow[]> = combineLatest([
    this.bookingService.getAll$(),
    this.slotService.getAll$(),
  ]).pipe(
    map(([bookings, slots]) => {
      const slotMap = new Map<string, Slot>(
        slots.map((s) => [s.id, s])
      );
      return bookings.map((booking) => ({
        booking,
        slot: slotMap.get(booking.slotId) ?? null,
      }));
    })
  );

  /** Tracks which booking ID is currently being updated (status change) */
  updatingId = signal<string | null>(null);

  /** Tracks which booking ID is currently being deleted */
  deletingId = signal<string | null>(null);

  async setStatus(id: string, status: BookingStatus): Promise<void> {
    this.updatingId.set(id);
    try {
      await this.bookingService.update(id, { status });
    } finally {
      this.updatingId.set(null);
    }
  }

  /**
   * Asks for confirmation then atomically deletes the booking and
   * decrements the parent slot's booked count via a Firestore Transaction.
   */
  async deleteBooking(row: BookingRow): Promise<void> {
    if (!confirm('Are you sure you want to delete this booking?')) return;

    this.deletingId.set(row.booking.id);
    try {
      await this.bookingService.deleteWithSlotDecrement(
        row.booking.id,
        row.booking.slotId,
      );
    } finally {
      this.deletingId.set(null);
    }
  }

  isUpdating(id: string): boolean {
    return this.updatingId() === id;
  }

  isDeleting(id: string): boolean {
    return this.deletingId() === id;
  }
}
