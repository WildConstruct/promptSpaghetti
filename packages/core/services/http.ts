export async function readJsonResponse(response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

export function getJsonErrorMessage(
  payload: unknown,
  fallback = 'Request failed'
): string {
  if (payload && typeof payload === 'object' && 'error' in payload) {
    return String((payload as { error?: unknown }).error || fallback);
  }

  return fallback;
}
