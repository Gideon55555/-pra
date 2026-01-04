import { Schema, model, models, type HydratedDocument, type Model } from 'mongoose';

export interface EventAttrs {
  title: string;
  slug?: string;
  description: string;
  overview: string;
  image: string;
  venue: string;
  location: string;
  date: string; // stored as ISO string
  time: string; // stored as normalized HH:mm (24h)
  mode: string;
  audience: string;
  agenda: string[];
  organizer: string;
  tags: string[];
}

export interface EventDoc extends EventAttrs {
  createdAt: Date;
  updatedAt: Date;
}

export type EventDocument = HydratedDocument<EventDoc>;

const nonEmptyTrimmedString = {
  validator: (value: string): boolean => typeof value === 'string' && value.trim().length > 0,
  message: 'Field must be a non-empty string',
};

const nonEmptyStringArray = {
  validator: (value: string[]): boolean =>
    Array.isArray(value) &&
    value.length > 0 &&
    value.every((item) => typeof item === 'string' && item.trim().length > 0),
  message: 'Field must be a non-empty array of non-empty strings',
};

const slugify = (input: string): string =>
  input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

const toIsoDateString = (value: string): string => {
  const trimmed = value.trim();
  const parsed = new Date(trimmed);
  if (Number.isNaN(parsed.getTime())) {
    throw new Error('Invalid date; expected a parseable date string');
  }
  // Normalize to ISO 8601 to keep a consistent, sortable representation.
  return parsed.toISOString();
};

const normalizeTime = (value: string): string => {
  const trimmed = value.trim();

  // Accept HH:mm or HH:mm:ss (24h)
  const match24 = /^([01]\d|2[0-3]):([0-5]\d)(?::([0-5]\d))?$/.exec(trimmed);
  if (match24) {
    const hh = match24[1];
    const mm = match24[2];
    return `${hh}:${mm}`;
  }

  // Accept h:mm AM/PM
  const match12 = /^(0?[1-9]|1[0-2]):([0-5]\d)\s*([AaPp][Mm])$/.exec(trimmed);
  if (match12) {
    const hour12 = Number(match12[1]);
    const minute = match12[2];
    const ampm = match12[3].toLowerCase();

    const hour24 = ((): number => {
      if (ampm === 'am') return hour12 === 12 ? 0 : hour12;
      return hour12 === 12 ? 12 : hour12 + 12;
    })();

    return `${String(hour24).padStart(2, '0')}:${minute}`;
  }

  throw new Error('Invalid time; expected HH:mm (24h) or h:mm AM/PM');
};

const eventSchema = new Schema<EventDoc>(
  {
    title: { type: String, required: true, validate: nonEmptyTrimmedString },
    slug: { type: String, unique: true, index: true },
    description: { type: String, required: true, validate: nonEmptyTrimmedString },
    overview: { type: String, required: true, validate: nonEmptyTrimmedString },
    image: { type: String, required: true, validate: nonEmptyTrimmedString },
    venue: { type: String, required: true, validate: nonEmptyTrimmedString },
    location: { type: String, required: true, validate: nonEmptyTrimmedString },
    date: { type: String, required: true, validate: nonEmptyTrimmedString },
    time: { type: String, required: true, validate: nonEmptyTrimmedString },
    mode: { type: String, required: true, validate: nonEmptyTrimmedString },
    audience: { type: String, required: true, validate: nonEmptyTrimmedString },
    agenda: { type: [String], required: true, validate: nonEmptyStringArray },
    organizer: { type: String, required: true, validate: nonEmptyTrimmedString },
    tags: { type: [String], required: true, validate: nonEmptyStringArray },
  },
  {
    timestamps: true,
  },
);

// Unique index on slug for fast lookup + uniqueness guarantees.
eventSchema.index({ slug: 1 }, { unique: true });

eventSchema.pre('save', function preSave(next) {
  try {
    // Slug: only (re)generate if title changes, to keep stable URLs.
    if (this.isModified('title') || !this.slug) {
      const newSlug = slugify(this.title);
      if (!newSlug) throw new Error('Unable to generate slug from title');
      this.slug = newSlug;
    }

    // Normalize date/time so all records use consistent formats.
    if (this.isModified('date')) this.date = toIsoDateString(this.date);
    if (this.isModified('time')) this.time = normalizeTime(this.time);

    next();
  } catch (err) {
    next(err instanceof Error ? err : new Error('Event validation failed'));
  }
});

export const Event: Model<EventDoc> = models.Event ?? model<EventDoc>('Event', eventSchema);
