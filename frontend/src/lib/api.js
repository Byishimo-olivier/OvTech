const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");

function resolveUrl(url) {
  if (/^https?:\/\//i.test(url)) {
    return url;
  }

  if (apiBaseUrl) {
    return `${apiBaseUrl}${url.startsWith("/") ? "" : "/"}${url}`;
  }

  return url;
}

export async function postJson(url, payload) {
  let response;

  try {
    response = await fetch(resolveUrl(url), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch (error) {
    throw new Error("Could not reach the server. Please check your connection and try again.");
  }

  const text = await response.text();
  let result = {};

  try {
    result = text ? JSON.parse(text) : {};
  } catch {
    result = { error: text };
  }

  if (!response.ok) {
    const proxyFailed = result.error && result.error.includes("ECONNREFUSED");
    throw new Error(
      proxyFailed
        ? "Could not reach the server. Please try again in a moment."
        : result.error || "Request failed. Please try again.",
    );
  }

  return result;
}

export async function getJson(url) {
  const response = await fetch(resolveUrl(url), { headers: { Accept: "application/json" } });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(result.error || "Request failed.");
  }
  return result;
}
