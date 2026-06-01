import { TemplateRenderer } from "#application/port/template-renderer.js";

export class HandlebarsTemplateRenderer implements TemplateRenderer {
    async render(templateId: string, payload: any) {
        switch (templateId) {
            case "event-created":
                return {
                    subject: `Event Created: ${payload.name}`,
                    html: `
                        <h1>Event Created</h1>
                        <p>Name: ${payload.name}</p>
                        <p>Date: ${payload.date}</p>
                        <p>Price: ${payload.price}</p>
                        <p>Capacity: ${payload.totalPeople}</p>
                    `,
                };
            case "event-updated":
                return {
                    subject: `Event Updated: ${payload.name}`,
                    html: `
                        <h1>Event Updated</h1>
                        <p>Name: ${payload.name}</p>
                        <p>Date: ${payload.date}</p>
                        <p>Price: ${payload.price}</p>
                        <p>Capacity: ${payload.totalPeople}</p>
                    `,
                };
            case "event-deleted":
                return {
                    subject: `Event Deleted: ${payload.name}`,
                    html: `
                        <h1>Event Deleted</h1>
                        <p>Name: ${payload.name}</p>
                        <p>Owner: ${payload.ownerEmail}</p>
                    `,
                };
            default:
                throw new Error(`Unknown template: ${templateId}`);
        }
    }
}
