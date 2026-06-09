import { PrometheusEventMetrics } from "#infrastructure/metrics/prometheus-event.metric.js";
import {
    EventQueryRepository,
    EventsQueryFilter,
    PagedEventsResult,
} from "../port/event-query.repository.js";

export class ListEventsQuery {
    constructor(
        private readonly repository: EventQueryRepository,
        private readonly metrics: PrometheusEventMetrics,
    ) {}

    async execute(filter: EventsQueryFilter): Promise<PagedEventsResult> {
        return this.metrics.trackOperation("list_events", async () => {
            return this.repository.findEvents(filter);
        });
    }
}
