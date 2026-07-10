import { Component, inject, signal } from '@angular/core';
import { AsyncPipe, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';

import { SlotService } from '../../services/slot.service';
import { Slot, SlotPayload } from '../../models/slot.model';

@Component({
  selector: 'app-slots',
  standalone: true,
  imports: [AsyncPipe, FormsModule],
  templateUrl: './slots.html',
  styleUrl: './slots.css',
})
export class Slots {
  private readonly slotService = inject(SlotService);
  private readonly location     = inject(Location);

  goBack(): void { this.location.back(); }

  /** Real-time Firestore stream — AsyncPipe handles subscribe/unsubscribe */
  readonly slots$ = this.slotService.getAll$();

  // ── UI state ───────────────────────────────────────────
  showForm     = signal(false);
  isSubmitting = signal(false);
  editingSlot  = signal<Slot | null>(null);
  errorMessage = signal('');

  // ── Form model (plain properties for ngModel) ──────────
  formDate     = '';
  formTime     = '';
  formCapacity = 1;

  /**
   * Today's date as a local ISO-8601 date string ("YYYY-MM-DD").
   * Computed once at construction so all comparisons within a session
   * use the same reference point. Used by both the [min] binding
   * and the TypeScript validation guard.
   */
  readonly todayStr: string = (() => {
    const d    = new Date();
    const yyyy = d.getFullYear();
    const mm   = String(d.getMonth() + 1).padStart(2, '0');
    const dd   = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  })();

  /**
   * Current local time as "HH:MM". Re-evaluated each time it is read
   * so the [min] binding on the time input stays accurate.
   */
  get nowTimeStr(): string {
    const n  = new Date();
    const hh = String(n.getHours()).padStart(2, '0');
    const mi = String(n.getMinutes()).padStart(2, '0');
    return `${hh}:${mi}`;
  }

  /**
   * Returns the minimum selectable time for the time input.
   *
   * When today is selected: returns current local time + 1 minute.
   * Adding one minute ensures the current minute itself is greyed out —
   * without this, [min]="09:51" still allows selecting 09:51 because
   * the browser treats min as inclusive.
   *
   * When a future date is selected: returns '' (no restriction).
   */
  get minTimeForDate(): string {
    if (this.formDate !== this.todayStr) return '';
    const n = new Date();
    n.setMinutes(n.getMinutes() + 1);          // advance by 1 minute
    const hh = String(n.getHours()).padStart(2, '0');
    const mi = String(n.getMinutes()).padStart(2, '0');
    return `${hh}:${mi}`;
  }

  // ── Form control ───────────────────────────────────────

  openCreateForm(): void {
    this.editingSlot.set(null);
    this.formDate     = '';
    this.formTime     = '';
    this.formCapacity = 1;
    this.errorMessage.set('');
    this.showForm.set(true);
  }

  openEditForm(slot: Slot): void {
    this.editingSlot.set(slot);
    this.formDate     = slot.date;
    this.formTime     = slot.time;
    this.formCapacity = slot.capacity;
    this.errorMessage.set('');
    this.showForm.set(true);
  }

  cancelForm(): void {
    this.showForm.set(false);
    this.editingSlot.set(null);
  }

  async submitForm(): Promise<void> {
    if (!this.formDate || !this.formTime || this.formCapacity < 1) return;

    // ── Past-date guard (Create only) ────────────────────────────────
    // Kept as a message-bearing guard because admins could still type a
    // past date into the input even with [min] set.
    if (!this.editingSlot() && this.formDate < this.todayStr) {
      this.errorMessage.set('Please select today or a future date.');
      return;
    }

    // ── Past-time silent backstop (Create only) ───────────────────────
    // The [min]="minTimeForDate" binding on the time input already greys
    // out past times in the picker — no error message is needed here.
    // This is a silent safety return for any edge-case bypass only.
    if (!this.editingSlot()) {
      const timeIsPastToday =
        this.formDate === this.todayStr && this.formTime <= this.nowTimeStr;
      if (timeIsPastToday) return;
    }

    // ── Duplicate slot check (Create only) ─────────────────────────────
    // Reads the already-subscribed in-memory snapshot — no extra Firestore
    // network call. firstValueFrom() takes the current emission and completes.
    if (!this.editingSlot()) {
      const existingSlots = await firstValueFrom(this.slots$);
      const isDuplicate = existingSlots.some(
        (s) => s.date === this.formDate && s.time === this.formTime
      );
      if (isDuplicate) {
        this.errorMessage.set(
          'This slot already exists. Please choose another date or time.'
        );
        return;
      }
    }

    this.isSubmitting.set(true);
    this.errorMessage.set('');

    try {
      const editing = this.editingSlot();

      if (editing) {
        await this.slotService.update(editing.id, {
          date:     this.formDate,
          time:     this.formTime,
          capacity: this.formCapacity,
        });
      } else {
        const payload: SlotPayload = {
          date:     this.formDate,
          time:     this.formTime,
          capacity: this.formCapacity,
          booked:   0,
        };
        await this.slotService.create(payload);
      }

      this.cancelForm();
    } catch {
      this.errorMessage.set('Something went wrong. Please try again.');
    } finally {
      this.isSubmitting.set(false);
    }
  }

  async deleteSlot(id: string): Promise<void> {
    if (!confirm('Delete this slot? This cannot be undone.')) return;
    try {
      await this.slotService.delete(id);
    } catch {
      // silent — future iteration can add a toast
    }
  }

  /** Seats remaining = capacity − booked */
  available(slot: Slot): number {
    return slot.capacity - slot.booked;
  }
}
