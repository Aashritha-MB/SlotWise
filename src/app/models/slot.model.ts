/**
 * Represents a bookable time slot stored in the `slots` Firestore collection.
 */
export interface Slot {
  /** Firestore document ID */
  id: string;

  /** Date of the slot — ISO 8601 date string e.g. "2024-08-15" */
  date: string;

  /** Time of the slot — 24-hour string e.g. "09:00" */
  time: string;

  /** Total capacity of the slot */
  capacity: number;

  /** Number of seats already booked */
  booked: number;
}

/**
 * Payload used when creating or updating a Slot.
 * Omits `id` because Firestore generates it on creation.
 */
export type SlotPayload = Omit<Slot, 'id'>;
