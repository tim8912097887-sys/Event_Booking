import { EventSlug } from "#domain/value-objects/event-slug.vo.js";
import { describe, expect, it } from "vitest";

describe("Event Slug Value Object", () => {
    it("when provide name with space between words should return slug replaced space with hyphen", () => {
        const slug = EventSlug.generate("event name");
        expect(slug.getValue()).toBe("event-name");
    });

    it("when provide name with uppercase should return slug with lowercase", () => {
        const slug = EventSlug.generate("Event Name wIth sPaCe");
        expect(slug.getValue()).toBe("event-name-with-space");
    });

    it("when provide name with special characters should return slug without them", () => {
        const slug = EventSlug.generate("Event N@ame wIt?h sPaCe");
        expect(slug.getValue()).toBe("event-name-with-space");
    });

    it("when provide name with extra space should return slug without them", () => {
        const slug = EventSlug.generate(" Event Name wIth sPaCe  ");
        expect(slug.getValue()).toBe("event-name-with-space");
    });

    it("when provide name with extra hyphen should return slug without them", () => {
        const slug = EventSlug.generate("Event -Name wIth -sPaCe");
        expect(slug.getValue()).toBe("event-name-with-space");
    });
});
