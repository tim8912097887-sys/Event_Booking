import { IdNotEmptyError } from "#domain/errors/id-not-empty-error.js";
import { InvalidEmailError } from "#domain/errors/invalid-email-error.js";
import { ERROR_CODE } from "#presentation/types/index.js";

export const errorMapper = (error: any) => {
    if (error instanceof IdNotEmptyError) {
        return {
            statusCode: ERROR_CODE.BAD_REQUEST,
            statusType: "IdNotEmptyError",
            detail: error.message,
        };
    }

    if (error instanceof InvalidEmailError) {
        return {
            statusCode: ERROR_CODE.BAD_REQUEST,
            statusType: "InvalidEmailError",
            detail: error.message,
        };
    }

    return {
        statusCode: ERROR_CODE.SERVER_ERROR,
        statusType: "ServerError",
        detail: "An unexpected error occurred. Please try again later.",
    };
};
