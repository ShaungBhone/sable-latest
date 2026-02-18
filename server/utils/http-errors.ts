import { createError } from "h3";

export function createBadRequestError(message: string) {
  return createError({
    statusCode: 400,
    statusMessage: "Bad Request",
    message,
  });
}

export function createUnauthorizedError(message: string) {
  return createError({
    statusCode: 401,
    statusMessage: "Unauthorized",
    message,
  });
}

export function createServerConfigurationError(message: string) {
  return createError({
    statusCode: 500,
    statusMessage: "Server configuration error",
    message,
  });
}

export function createBadGatewayError(message: string) {
  return createError({
    statusCode: 502,
    statusMessage: "Bad Gateway",
    message,
  });
}
