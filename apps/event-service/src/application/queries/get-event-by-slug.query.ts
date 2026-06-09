import { PrometheusEventMetrics } from "#infrastructure/metrics/prometheus-event.metric.js";
import { PublicEventDto } from "../dto/public-event.dto.js";
import { EventQueryRepository } from "../port/event-query.repository.js";

export class GetEventBySlugQuery {
    constructor(
        private readonly repository: EventQueryRepository,
        private readonly metrics: PrometheusEventMetrics,
    ) {}

    async execute(slug: string): Promise<PublicEventDto | null> {
        return this.metrics.trackOperation("get_event_by_slug", async () => {
            const event = await this.repository.findEventBySlug(slug);
            if (!event) {
                return null;
            }
            return event;
        });
    }
}
