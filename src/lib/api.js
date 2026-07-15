export async function postJson(url, payload) {
  let response;

  try {
    response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch (error) {
    throw new Error("Backend server is not running. Start it with npm run server or npm run dev:all.");
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
        ? "Backend server is not running. Start it with npm run server or npm run dev:all."
        : result.error || "Request failed. Please try again.",
    );
  }

  return result;
}
