export class PublicEventDto {
    constructor(
        public readonly slug: string,
        public readonly name: string,
        public readonly description: string,
        public readonly date: Date,
        public readonly capacity: number,
        public readonly price: number,
    ) {}

    static from(event: PublicEventDto): PublicEventDto {
        return new PublicEventDto(
            event.slug,
            event.name,
            event.description,
            event.date,
            event.capacity,
            event.price,
        );
    }
}
