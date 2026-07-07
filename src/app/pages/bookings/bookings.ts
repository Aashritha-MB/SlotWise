import { Component, inject, signal } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
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
  imports: [AsyncPipe, RouterLink],
  templateUrl: './bookings.html',
  styleUrl: './bookings.css',
})
export class Bookings {
  private readonly bookingService = inject(BookingService);
  private readonly slotService    = inject(SlotService);

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

  /** Tracks which booking ID is currently being updated */
  updatingId = signal<string | null>(null);

  async setStatus(id: string, status: BookingStatus): Promise<void> {
    this.updatingId.set(id);
    try {
      await this.bookingService.update(id, { status });
    } finally {
      this.updatingId.set(null);
    }
  }

  isUpdating(id: string): boolean {
    return this.updatingId() === id;
  }
}
