export type TemplateId = "event-created" | "event-updated" | "event-deleted";

export interface RenderedTemplate {
    subject: string;
    html: string;
}

export interface TemplateRenderer {
    render(
        templateId: TemplateId,
        payload: Record<string, unknown>,
    ): Promise<RenderedTemplate>;
}
