import {
    pgTable,
    uuid,
    varchar,
    text,
    integer,
    timestamp,
    numeric,
    pgEnum,
} from "drizzle-orm/pg-core";

export const eventStatusEnum = pgEnum("event_status", [
    "DRAFT",
    "PUBLISHED",
    "CANCELLED",
]);

export const events = pgTable("events", {
    id: uuid("id").primaryKey(),

    creatorId: uuid("creator_id").notNull(),

    name: varchar("name", {
        length: 255,
    }).notNull(),

    description: text("description").notNull(),

    date: timestamp("date", {
        withTimezone: true,
        mode: "date",
    }).notNull(),

    price: numeric("price", {
        precision: 10,
        scale: 2,
    }).notNull(),

    capacity: integer("capacity").notNull(),

    status: eventStatusEnum("status").notNull().default("DRAFT"),

    createdAt: timestamp("created_at", {
        withTimezone: true,
    })
        .notNull()
        .defaultNow(),

    updatedAt: timestamp("updated_at", {
        withTimezone: true,
    })
        .notNull()
        .defaultNow(),

    deletedAt: timestamp("deleted_at", {
        withTimezone: true,
    }),
});
