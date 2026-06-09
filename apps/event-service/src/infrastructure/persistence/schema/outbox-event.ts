import { jsonb, pgTable, timestamp, uuid, varchar } from "drizzle-orm/pg-core";

export const outboxEvents = pgTable("outbox_events", {
    id: uuid().primaryKey(),
    eventName: varchar("event_name", { length: 255 }).notNull(),
    payload: jsonb().notNull(),
    traceContext: jsonb("trace_context"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    publishedAt: timestamp("published_at"),
});
