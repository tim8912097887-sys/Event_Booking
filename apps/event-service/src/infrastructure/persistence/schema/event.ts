import { sql } from "drizzle-orm";
import {
    pgTable,
    uuid,
    varchar,
    text,
    integer,
    timestamp,
    numeric,
    pgEnum,
    index,
} from "drizzle-orm/pg-core";

export const eventStatusEnum = pgEnum("event_status", [
    "DRAFT",
    "PUBLISHED",
    "CANCELLED",
]);

export const events = pgTable(
    "events",
    {
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

        slug: varchar("slug", { length: 255 }).notNull().unique(),

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
    },
    (table) => [
        // Partial index for Date sorting
        index("idx_events_published_date")
            .on(table.date.desc(), table.price.asc(), table.id.asc())
            .where(
                sql`${table.status} = 'PUBLISHED' AND ${table.deletedAt} IS NULL`,
            ),

        // Partial index for Price sorting
        index("idx_events_published_price")
            .on(table.price.asc(), table.date.desc(), table.id.asc())
            .where(
                sql`${table.status} = 'PUBLISHED' AND ${table.deletedAt} IS NULL`,
            ),
    ],
);
