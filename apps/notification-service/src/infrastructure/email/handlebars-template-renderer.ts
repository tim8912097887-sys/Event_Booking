import { TemplateRenderer } from "#application/port/template-renderer.js";

export class HandlebarsTemplateRenderer implements TemplateRenderer {
    async render(templateId: string, payload: any) {
        switch (templateId) {
            case "event-published":
                return {
                    subject: `Event Published: ${payload.name}`,
                    html: ``,
                };
            default:
                throw new Error(`Unknown template: ${templateId}`);
        }
    }
}
