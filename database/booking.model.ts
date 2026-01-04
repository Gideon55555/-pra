import {
  Schema,
  model,
  models,
  type HydratedDocument,
  type Model,
  Types,
} from 'mongoose';

import { Event } from './event.model';

export interface BookingAttrs {
  eventId: Types.ObjectId;
  email: string;
}

export interface BookingDoc extends BookingAttrs {
  createdAt: Date;
  updatedAt: Date;
}

export type BookingDocument = HydratedDocument<BookingDoc>;

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const bookingSchema = new Schema<BookingDoc>(
  {
    // Store the reference for relational queries (populate) and index for speed.
    eventId: {
      type: Schema.Types.ObjectId,
      ref: 'Event',
      required: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      validate: {
        validator: (value: string): boolean => emailRegex.test(value),
        message: 'Invalid email address',
      },
    },
  },
  { timestamps: true },
);

bookingSchema.pre('save', async function preSave(next) {
  try {
    // Validate the referenced Event exists before allowing a booking.
    const exists = await Event.exists({ _id: this.eventId });
    if (!exists) {
      throw new Error('Invalid eventId: referenced event does not exist');
    }
    next();
  } catch (err) {
    next(err instanceof Error ? err : new Error('Booking validation failed'));
  }
});

export const Booking: Model<BookingDoc> =
  models.Booking ?? model<BookingDoc>('Booking', bookingSchema);
