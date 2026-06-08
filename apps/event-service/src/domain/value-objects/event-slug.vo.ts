export class EventSlug {
    private constructor(public readonly value: string) {}

    static generate(name: string) {
        const slug = name
            .trim()
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, "")
            .replace(/\s+/g, "-")
            .replace(/-+/g, "-");

        return new EventSlug(slug);
    }

    static from(value: string) {
        return new EventSlug(value);
    }

    getValue(): string {
        return this.value;
    }
}
