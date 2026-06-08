import { MessageBrokerType } from "@event-booking/message-broker";

export class EventProducer {
    constructor(private readonly broker: MessageBrokerType) {}
    async start() {
        await this.broker.producer.connect();
    }

    async stop() {
        await this.broker.producer.disconnect();
    }

    getProducer() {
        return this.broker.producer;
    }
}
