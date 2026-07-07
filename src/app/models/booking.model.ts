/**
 * Allowed lifecycle states for a Booking.
 */
export type BookingStatus = 'pending' | 'confirmed' | 'cancelled';

/**
 * Represents a booking stored in the `bookings` Firestore collection.
 */
export interface Booking {
  /** Firestore document ID */
  id: string;

  /** Reference to the parent Slot document ID */
  slotId: string;

  /** Full name of the person making the booking */
  name: string;

  /** Contact detail — phone number or email */
  contact: string;

  /** Current lifecycle status of the booking */
  status: BookingStatus;
}

/**
 * Payload used when creating or updating a Booking.
 * Omits `id` because Firestore generates it on creation.
 */
export type BookingPayload = Omit<Booking, 'id'>;
