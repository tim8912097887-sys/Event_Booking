import { createMessageBroker } from "@event-booking/message-broker";

export const messageBroker = createMessageBroker({
    clientId: "notification-service",
    brokers: ["kafka-server:9092"],
});

export const brokerDisconnect = async (): Promise<void> => {
    await messageBroker.consumer("notification-service").disconnect();
    await messageBroker.producer.disconnect();
    await messageBroker.admin.disconnect();
};
