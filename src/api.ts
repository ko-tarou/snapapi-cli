const API_URL = "https://snapapi.akokoa1221.workers.dev/api/mock";
const BASE_URL = "https://snapapi.akokoa1221.workers.dev";

export interface ApiResult {
  id: string;
  endpoints: string[];
}

export async function createMockApi(json: string): Promise<ApiResult> {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: json,
  });

  if (!res.ok) {
    let message = "Failed to create API";
    try {
      const err = await res.json();
      if (err.error) message = err.error;
    } catch {
      // ignore parse errors
    }
    throw new Error(message);
  }

  return res.json();
}

export function formatResult(result: ApiResult): string {
  const mockUrl = `${BASE_URL}/api/mock/${result.id}`;
  const webhookUrl = `${BASE_URL}/api/webhook/${result.id}`;
  const docsUrl = `${BASE_URL}/docs/${result.id}`;
  const endpoints = result.endpoints.join(", ");
  const firstEndpoint = result.endpoints[0] || "";

  return [
    "",
    "\x1b[32m\u2713\x1b[0m Mock API created!",
    "",
    `  Base URL:  \x1b[36m${mockUrl}\x1b[0m`,
    `  Webhook:   \x1b[36m${webhookUrl}\x1b[0m`,
    `  Docs:      \x1b[36m${docsUrl}\x1b[0m`,
    `  Endpoints: ${endpoints}`,
    "",
    "  Try it:",
    `    curl ${mockUrl}/${firstEndpoint}`,
    "",
  ].join("\n");
}
