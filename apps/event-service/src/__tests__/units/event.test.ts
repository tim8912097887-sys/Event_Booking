import { Event } from "#domain/event/entities/event.js";
import { describe, expect, it } from "vitest";
import crypto from "crypto";
import {
    EventNotDraftError,
    EventDeletedModificationError,
    EventAlreadyDeletedError,
    PublishedEventDeletionError,
    EventAlreadyCancelledError,
} from "#domain/errors/entity.error.js";
import { InvalidEventDescriptionError } from "#domain/errors/event-description.error.js";
import { InvalidEventDateError } from "#domain/errors/event-date.error.js";
import { InvalidEventCapacityError } from "#domain/errors/event-capacity.error.js";
import { InvalidEventPriceError } from "#domain/errors/event-price.error.js";
import { InvalidEventNameError } from "#domain/errors/event-name.error.js";

describe("Event", () => {
    describe("create", () => {
        it("when create event with valid data should return event entity contain draft status,id,null deletedAt and more", () => {
            const event = Event.create({
                name: "event name",
                description: "event description",
                creatorId: crypto.randomUUID(),
                date: "2026-11-01",
                capacity: 10,
                price: 10,
            });

            expect(event.getStatus()).toBe("DRAFT");
            expect(event.getId()).not.toBeNull();
            expect(event.getDeletedAt()).toBeNull();
        });
    });

    describe("Change Name", () => {
        it("when change name with valid data and state should return event entity with new name", () => {
            const event = Event.create({
                name: "event name",
                description: "event description",
                creatorId: crypto.randomUUID(),
                date: "2026-11-01",
                capacity: 10,
                price: 10,
            });

            event.changeName("new name");

            expect(event.getName()).toBe("new name");
        });

        it("when change name with published state should throw EventNotDraftError", () => {
            const event = Event.create({
                name: "event name",
                description: "event description",
                creatorId: crypto.randomUUID(),
                date: "2026-11-01",
                capacity: 10,
                price: 10,
            });

            event.publish("example@gmail.com");

            expect(() => event.changeName("new name")).toThrow(
                new EventNotDraftError(),
            );
        });

        it("when change name with deleted state should throw EventDeletedModificationError", () => {
            const event = Event.create({
                name: "event name",
                description: "event description",
                creatorId: crypto.randomUUID(),
                date: "2026-11-01",
                capacity: 10,
                price: 10,
            });

            event.delete();

            expect(() => event.changeName("new name")).toThrow(
                new EventDeletedModificationError(),
            );
        });

        it("when change name with cancelled state should throw EventNotDraftError", () => {
            const event = Event.create({
                name: "event name",
                description: "event description",
                creatorId: crypto.randomUUID(),
                date: "2026-11-01",
                capacity: 10,
                price: 10,
            });

            event.cancel();

            expect(() => event.changeName("new name")).toThrow(
                new EventNotDraftError(),
            );
        });

        it("when change name with invalid value should throw InvalidEventNameError", () => {
            const event = Event.create({
                name: "event name",
                description: "event description",
                creatorId: crypto.randomUUID(),
                date: "2026-11-01",
                capacity: 10,
                price: 10,
            });

            expect(() => event.changeName("")).toThrow(
                new InvalidEventNameError(),
            );
        });
    });

    describe("Change Description", () => {
        it("when change description with valid data and state should return event entity with new description", () => {
            const event = Event.create({
                name: "event name",
                description: "event description",
                creatorId: crypto.randomUUID(),
                date: "2026-11-01",
                capacity: 10,
                price: 10,
            });

            event.changeDescription("a new valid description");

            expect(event.getDescription()).toBe("a new valid description");
        });

        it("when change description with published state should throw EventNotDraftError", () => {
            const event = Event.create({
                name: "event name",
                description: "event description",
                creatorId: crypto.randomUUID(),
                date: "2026-11-01",
                capacity: 10,
                price: 10,
            });

            event.publish("owner@example.com");

            expect(() => event.changeDescription("new description")).toThrow(
                new EventNotDraftError(),
            );
        });

        it("when change description with cancelled state should throw EventNotDraftError", () => {
            const event = Event.create({
                name: "event name",
                description: "event description",
                creatorId: crypto.randomUUID(),
                date: "2026-11-01",
                capacity: 10,
                price: 10,
            });

            event.cancel();

            expect(() => event.changeDescription("new description")).toThrow(
                new EventNotDraftError(),
            );
        });

        it("when change description with invalid value should throw InvalidEventDescriptionError", () => {
            const event = Event.create({
                name: "event name",
                description: "event description",
                creatorId: crypto.randomUUID(),
                date: "2026-11-01",
                capacity: 10,
                price: 10,
            });

            expect(() => event.changeDescription("short")).toThrow(
                new InvalidEventDescriptionError(),
            );
        });

        it("when change description with deleted state should throw EventDeletedModificationError", () => {
            const event = Event.create({
                name: "event name",
                description: "event description",
                creatorId: crypto.randomUUID(),
                date: "2026-11-01",
                capacity: 10,
                price: 10,
            });

            event.delete();

            expect(() => event.changeDescription("new description")).toThrow(
                new EventDeletedModificationError(),
            );
        });
    });

    describe("Change Date", () => {
        it("when change date with valid future date should update date", () => {
            const event = Event.create({
                name: "event name",
                description: "event description",
                creatorId: crypto.randomUUID(),
                date: "2026-11-01",
                capacity: 10,
                price: 10,
            });

            event.changeDate("2026-12-01");

            expect(event.getDate().toISOString().startsWith("2026-12-01")).toBe(
                true,
            );
        });

        it("when change date to past should throw InvalidEventDateError", () => {
            const event = Event.create({
                name: "event name",
                description: "event description",
                creatorId: crypto.randomUUID(),
                date: "2026-11-01",
                capacity: 10,
                price: 10,
            });

            expect(() => event.changeDate("2000-01-01")).toThrow(
                new InvalidEventDateError(),
            );
        });

        it("when change date with published state should throw EventNotDraftError", () => {
            const event = Event.create({
                name: "event name",
                description: "event description",
                creatorId: crypto.randomUUID(),
                date: "2026-11-01",
                capacity: 10,
                price: 10,
            });

            event.publish("owner@example.com");

            expect(() => event.changeDate("2026-12-01")).toThrow(
                new EventNotDraftError(),
            );
        });

        it("when change date with cancelled state should throw EventNotDraftError", () => {
            const event = Event.create({
                name: "event name",
                description: "event description",
                creatorId: crypto.randomUUID(),
                date: "2026-11-01",
                capacity: 10,
                price: 10,
            });

            event.cancel();

            expect(() => event.changeDate("2026-12-01")).toThrow(
                new EventNotDraftError(),
            );
        });

        it("when change date with deleted state should throw EventDeletedModificationError", () => {
            const event = Event.create({
                name: "event name",
                description: "event description",
                creatorId: crypto.randomUUID(),
                date: "2026-11-01",
                capacity: 10,
                price: 10,
            });

            event.delete();

            expect(() => event.changeDate("2026-12-01")).toThrow(
                new EventDeletedModificationError(),
            );
        });
    });

    describe("Change Capacity", () => {
        it("when change capacity with valid value should update capacity", () => {
            const event = Event.create({
                name: "event name",
                description: "event description",
                creatorId: crypto.randomUUID(),
                date: "2026-11-01",
                capacity: 10,
                price: 10,
            });

            event.changeCapacity(50);

            expect(event.getCapacity()).toBe(50);
        });

        it("when change capacity with invalid value should throw InvalidEventCapacityError", () => {
            const event = Event.create({
                name: "event name",
                description: "event description",
                creatorId: crypto.randomUUID(),
                date: "2026-11-01",
                capacity: 10,
                price: 10,
            });

            expect(() => event.changeCapacity(0)).toThrow(
                new InvalidEventCapacityError(),
            );

            expect(() => event.changeCapacity(1001)).toThrow(
                new InvalidEventCapacityError(),
            );
        });

        it("when change capacity with published state should throw EventNotDraftError", () => {
            const event = Event.create({
                name: "event name",
                description: "event description",
                creatorId: crypto.randomUUID(),
                date: "2026-11-01",
                capacity: 10,
                price: 10,
            });

            event.publish("owner@example.com");

            expect(() => event.changeCapacity(20)).toThrow(
                new EventNotDraftError(),
            );
        });

        it("when change capacity with cancelled state should throw EventNotDraftError", () => {
            const event = Event.create({
                name: "event name",
                description: "event description",
                creatorId: crypto.randomUUID(),
                date: "2026-11-01",
                capacity: 10,
                price: 10,
            });

            event.cancel();

            expect(() => event.changeCapacity(20)).toThrow(
                new EventNotDraftError(),
            );
        });

        it("when change capacity with deleted state should throw EventDeletedModificationError", () => {
            const event = Event.create({
                name: "event name",
                description: "event description",
                creatorId: crypto.randomUUID(),
                date: "2026-11-01",
                capacity: 10,
                price: 10,
            });

            event.delete();

            expect(() => event.changeCapacity(20)).toThrow(
                new EventDeletedModificationError(),
            );
        });
    });

    describe("Change Price", () => {
        it("when change price with valid value should update price", () => {
            const event = Event.create({
                name: "event name",
                description: "event description",
                creatorId: crypto.randomUUID(),
                date: "2026-11-01",
                capacity: 10,
                price: 10,
            });

            event.changePrice(25);

            expect(event.getPrice()).toBe(25);
        });

        it("when change price with negative value should throw InvalidEventPriceError", () => {
            const event = Event.create({
                name: "event name",
                description: "event description",
                creatorId: crypto.randomUUID(),
                date: "2026-11-01",
                capacity: 10,
                price: 10,
            });

            expect(() => event.changePrice(-1)).toThrow(
                new InvalidEventPriceError(),
            );
        });

        it("when change price with published state should throw EventNotDraftError", () => {
            const event = Event.create({
                name: "event name",
                description: "event description",
                creatorId: crypto.randomUUID(),
                date: "2026-11-01",
                capacity: 10,
                price: 10,
            });

            event.publish("owner@example.com");

            expect(() => event.changePrice(20)).toThrow(
                new EventNotDraftError(),
            );
        });

        it("when change price with cancelled state should throw EventNotDraftError", () => {
            const event = Event.create({
                name: "event name",
                description: "event description",
                creatorId: crypto.randomUUID(),
                date: "2026-11-01",
                capacity: 10,
                price: 10,
            });

            event.cancel();

            expect(() => event.changePrice(20)).toThrow(
                new EventNotDraftError(),
            );
        });

        it("when change price with deleted state should throw EventDeletedModificationError", () => {
            const event = Event.create({
                name: "event name",
                description: "event description",
                creatorId: crypto.randomUUID(),
                date: "2026-11-01",
                capacity: 10,
                price: 10,
            });

            event.delete();

            expect(() => event.changePrice(20)).toThrow(
                new EventDeletedModificationError(),
            );
        });
    });

    describe("Delete / Publish / Cancel edge cases", () => {
        it("delete on draft should set deletedAt", () => {
            const event = Event.create({
                name: "event name",
                description: "event description",
                creatorId: crypto.randomUUID(),
                date: "2026-11-01",
                capacity: 10,
                price: 10,
            });

            event.delete();

            expect(event.getDeletedAt()).not.toBeNull();
        });

        it("delete when already deleted should throw EventAlreadyDeletedError", () => {
            const event = Event.create({
                name: "event name",
                description: "event description",
                creatorId: crypto.randomUUID(),
                date: "2026-11-01",
                capacity: 10,
                price: 10,
            });

            event.delete();

            expect(() => event.delete()).toThrow(
                new EventAlreadyDeletedError(),
            );
        });

        it("delete when published should throw PublishedEventDeletionError", () => {
            const event = Event.create({
                name: "event name",
                description: "event description",
                creatorId: crypto.randomUUID(),
                date: "2026-11-01",
                capacity: 10,
                price: 10,
            });

            event.publish("owner@example.com");

            expect(() => event.delete()).toThrow(
                new PublishedEventDeletionError(),
            );
        });

        it("cancel when deleted should throw EventDeletedModificationError", () => {
            const event = Event.create({
                name: "event name",
                description: "event description",
                creatorId: crypto.randomUUID(),
                date: "2026-11-01",
                capacity: 10,
                price: 10,
            });

            event.delete();

            expect(() => event.cancel()).toThrow(
                new EventDeletedModificationError(),
            );
        });

        it("cancel when already cancelled should throw EventAlreadyCancelledError", () => {
            const event = Event.create({
                name: "event name",
                description: "event description",
                creatorId: crypto.randomUUID(),
                date: "2026-11-01",
                capacity: 10,
                price: 10,
            });

            event.cancel();

            expect(() => event.cancel()).toThrow(
                new EventAlreadyCancelledError(),
            );
        });

        it("cancel published event should set status to CANCELLED and emit event", () => {
            const event = Event.create({
                name: "event name",
                description: "event description",
                creatorId: crypto.randomUUID(),
                date: "2026-11-01",
                capacity: 10,
                price: 10,
            });

            event.publish("owner@example.com");

            event.cancel();

            expect(event.getStatus()).toBe("CANCELLED");
        });

        it("cancel should set status to CANCELLED and emit event", () => {
            const event = Event.create({
                name: "event name",
                description: "event description",
                creatorId: crypto.randomUUID(),
                date: "2026-11-01",
                capacity: 10,
                price: 10,
            });

            event.cancel();

            expect(event.getStatus()).toBe("CANCELLED");
        });

        it("publish should set status to PUBLISHED and emit event", () => {
            const event = Event.create({
                name: "event name",
                description: "event description",
                creatorId: crypto.randomUUID(),
                date: "2026-11-01",
                capacity: 10,
                price: 10,
            });

            event.publish("owner@example.com");

            expect(event.getStatus()).toBe("PUBLISHED");
        });

        it("publish when already published should throw EventNotDraftError", () => {
            const event = Event.create({
                name: "event name",
                description: "event description",
                creatorId: crypto.randomUUID(),
                date: "2026-11-01",
                capacity: 10,
                price: 10,
            });

            event.publish("owner@example.com");

            expect(() => event.publish("owner@example.com")).toThrow(
                new EventNotDraftError(),
            );
        });

        it("publish when deleted should throw EventDeletedModificationError", () => {
            const event = Event.create({
                name: "event name",
                description: "event description",
                creatorId: crypto.randomUUID(),
                date: "2026-11-01",
                capacity: 10,
                price: 10,
            });

            event.delete();

            expect(() => event.publish("owner@example.com")).toThrow(
                new EventDeletedModificationError(),
            );
        });

        it("publish when cancelled should throw EventNotDraftError", () => {
            const event = Event.create({
                name: "event name",
                description: "event description",
                creatorId: crypto.randomUUID(),
                date: "2026-11-01",
                capacity: 10,
                price: 10,
            });

            event.cancel();

            expect(() => event.publish("owner@example.com")).toThrow(
                new EventNotDraftError(),
            );
        });
    });
});
