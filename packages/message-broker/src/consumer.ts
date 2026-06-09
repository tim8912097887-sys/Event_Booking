import { Consumer } from "kafkajs";
import { EventMap, EventName } from "./events.js";

type Handler<T extends EventName> = ({
    payload,
    headers,
}: {
    payload: EventMap[T];
    headers?: Record<string, string>;
}) => Promise<void>;

export class KafkaConsumer {
    private handlers = new Map<EventName, Handler<EventName>>();

    constructor(private readonly consumer: Consumer) {}

    async connect() {
        await this.consumer.connect();
    }

    async disconnect() {
        await this.consumer.disconnect();
    }

    async subscribe<T extends EventName>(topic: T, handler: Handler<T>) {
        await this.consumer.subscribe({
            topic,
            fromBeginning: false,
        });

        this.handlers.set(topic, handler as any);
    }

    async run() {
        await this.consumer.run({
            eachMessage: async ({ topic, message }) => {
                if (!message.value) return;

                const handler = this.handlers.get(topic as EventName);
                if (!handler) return;
                const MAX_RETRIES = 5;
                let attempts = 0;
                const payload = JSON.parse(message.value.toString());
                const headers =
                    (message.headers as Record<string, string>) || {};
                while (attempts < MAX_RETRIES) {
                    try {
                        await handler({ payload, headers });
                        return;
                    } catch (_error) {
                        attempts += 1;
                        const delay = Math.min(1000 * 2 ** attempts, 30000);
                        console.error(
                            `Failed to process message after ${attempts} attempts.`,
                        );
                        await this.sleep(delay);
                    }
                }
                console.error(
                    `Failed to process message after ${MAX_RETRIES} attempts.`,
                );
            },
        });
    }

    async sleep(ms: number): Promise<void> {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }
}
