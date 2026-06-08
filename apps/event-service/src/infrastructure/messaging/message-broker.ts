import { createMessageBroker } from "@event-booking/message-broker";

export const messageBroker = createMessageBroker({
    clientId: "event-service",
    brokers: ["kafka-server:9092"],
});
