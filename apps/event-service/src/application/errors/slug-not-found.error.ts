import { ApplicationError } from "./application.error.js";

export class SlugNotFoundError extends ApplicationError {
    constructor(slug: string) {
        super(`Event with slug ${slug} not found`);
    }
}
