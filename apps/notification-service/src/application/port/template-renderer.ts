export type TemplateId = "event-published" | "event-cancelled";

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
