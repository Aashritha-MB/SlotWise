import { Component, inject, signal } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { SlotService } from '../../services/slot.service';
import { Slot, SlotPayload } from '../../models/slot.model';

@Component({
  selector: 'app-slots',
  standalone: true,
  imports: [AsyncPipe, FormsModule, RouterLink],
  templateUrl: './slots.html',
  styleUrl: './slots.css',
})
export class Slots {
  private readonly slotService = inject(SlotService);

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
