declare module "cloudflare:workers" {
  export const env: {
    DB?: D1Database;
    DOCUMENTS?: R2Bucket;
    HUNTER_API_KEY?: string;
    LLM_API_KEY?: string;
    FORECAST_API_URL?: string;
    [key: string]: unknown;
  };
}

interface D1PreparedStatement {
  bind(...values: unknown[]): D1PreparedStatement;
  run(): Promise<unknown>;
  all<T = Record<string, unknown>>(): Promise<{ results: T[] }>;
}

interface D1Database {
  prepare(query: string): D1PreparedStatement;
  batch(statements: D1PreparedStatement[]): Promise<unknown>;
}

interface R2BucketPutOptions {
  httpMetadata?: {
    contentType?: string;
  };
  customMetadata?: Record<string, string>;
}

interface R2Bucket {
  put(
    key: string,
    value: ArrayBuffer | ArrayBufferView | Blob | ReadableStream | string,
    options?: R2BucketPutOptions,
  ): Promise<unknown>;
}

interface Fetcher {
  fetch(request: Request): Promise<Response>;
}