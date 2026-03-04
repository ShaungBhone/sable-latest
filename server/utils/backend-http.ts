import type { H3Event, RouterMethod } from "h3";
import { $fetch } from "ofetch";
import { useRuntimeConfig } from "nitropack/runtime/internal/config";
import { createBadGatewayError, createUpstreamError } from "./http-errors";

const FETCH_METHODS = new Set<Uppercase<RouterMethod>>([
  "GET",
  "HEAD",
  "PATCH",
  "POST",
  "PUT",
  "DELETE",
  "CONNECT",
  "OPTIONS",
  "TRACE",
]);

export function normalizeFetchMethod(
  value: unknown,
  fallback: Uppercase<RouterMethod>,
) {
  if (typeof value !== "string") {
    return fallback;
  }

  const normalized = value.trim().toUpperCase();
  if (FETCH_METHODS.has(normalized as Uppercase<RouterMethod>)) {
    return normalized as Uppercase<RouterMethod>;
  }

  return fallback;
}

export function buildBackendUrl(baseUrl: string, path: string) {
  const normalizedBase = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
  const normalizedPath = path.startsWith("/") ? path.slice(1) : path;
  return new URL(normalizedPath, normalizedBase).toString();
}

export function interpolatePath(
  pathTemplate: string,
  key: string,
  value: string,
) {
  const encodedValue = encodeURIComponent(value);
  const needle = `:${key}`;

  if (pathTemplate.includes(needle)) {
    return pathTemplate.replace(needle, encodedValue);
  }

  return `${pathTemplate.replace(/\/$/, "")}/${encodedValue}`;
}

function readMessage(candidate: unknown) {
  if (typeof candidate === "string" && candidate.trim().length > 0) {
    return candidate;
  }

  return null;
}

function extractMessage(data: unknown): string | null {
  if (!data || typeof data !== "object") {
    return null;
  }

  const record = data as Record<string, unknown>;

  return (
    readMessage(record.message) ??
    readMessage(record.statusMessage) ??
    (record.data && typeof record.data === "object"
      ? extractMessage(record.data)
      : null)
  );
}

export function getUpstreamErrorInfo(error: unknown) {
  if (!error || typeof error !== "object") {
    return null;
  }

  const record = error as Record<string, unknown>;
  const response =
    record.response && typeof record.response === "object"
      ? (record.response as Record<string, unknown>)
      : null;
  const data = record.data ?? response?.data;
  const statusCodeCandidates = [
    record.statusCode,
    record.status,
    response?.status,
    data && typeof data === "object"
      ? (data as Record<string, unknown>).statusCode
      : null,
    data && typeof data === "object" ? (data as Record<string, unknown>).code : null,
  ];
  const statusCode = statusCodeCandidates.find(
    (candidate) => typeof candidate === "number" && Number.isFinite(candidate),
  ) as number | undefined;

  if (!statusCode) {
    return null;
  }

  return {
    statusCode,
    statusMessage:
      readMessage(record.statusMessage) ??
      readMessage(response?.statusText) ??
      undefined,
    message:
      extractMessage(data) ??
      readMessage(record.message) ??
      "Upstream request failed.",
    data,
  };
}

export function createErrorFromUpstream(
  error: unknown,
  fallbackMessage: string,
  logPrefix?: string,
) {
  const upstream = getUpstreamErrorInfo(error);

  if (upstream) {
    return createUpstreamError(
      upstream.statusCode,
      upstream.message,
      upstream.statusMessage,
    );
  }

  if (logPrefix) {
    console.error(logPrefix, error);
  }

  return createBadGatewayError(fallbackMessage);
}

export async function fetchBackend<TReturn>(
  event: H3Event,
  path: string,
  options: {
    method?: Uppercase<RouterMethod>;
    headers?: Record<string, string>;
    body?: BodyInit | object | null;
    query?: Record<string, string | number | boolean | undefined>;
    fallbackMessage: string;
    logPrefix?: string;
  },
) {
  const config = useRuntimeConfig(event);
  const url = buildBackendUrl(config.auth.backendBaseUrl, path);

  try {
    return await $fetch<TReturn>(url, {
      method: options.method,
      headers: options.headers,
      body: options.body ?? undefined,
      query: options.query,
    });
  } catch (error) {
    throw createErrorFromUpstream(
      error,
      options.fallbackMessage,
      options.logPrefix,
    );
  }
}
