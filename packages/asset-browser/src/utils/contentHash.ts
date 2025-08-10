// Simple non-cryptographic hash for deterministic keys
export function contentHash(input: string): string {
  let h = 5381;
  for (let i = 0; i < input.length; i++) {
    h = (h * 33) ^ input.charCodeAt(i);
  }
  // Convert to unsigned and base36 for compactness
  return (h >>> 0).toString(36);
}
