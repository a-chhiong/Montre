/**
 * Pure domain use case for compressing and decompressing Markdown slide decks
 * using the W3C standard CompressionStream('deflate-raw') and URL-safe Base64.
 * 
 * 100% pure TypeScript with zero third-party npm dependencies.
 */

export function uint8ArrayToBase64Url(bytes: Uint8Array): string {
  let binary = '';
  const chunkSize = 8192;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    const chunk = bytes.subarray(i, Math.min(i + chunkSize, bytes.length));
    binary += String.fromCharCode.apply(null, chunk as unknown as number[]);
  }
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

export function base64UrlToUint8Array(base64url: string): Uint8Array {
  let base64 = base64url.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4 !== 0) {
    base64 += '=';
  }
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

/**
 * Compresses a Markdown string into a URL-safe Base64 string via raw DEFLATE (RFC 1951).
 */
export async function compressDeck(markdown: string): Promise<string> {
  if (!markdown || typeof markdown !== 'string') return '';

  const inputBytes = new TextEncoder().encode(markdown);

  if (typeof CompressionStream === 'undefined') {
    throw new Error('CompressionStream is not supported in this environment.');
  }

  const cs = new CompressionStream('deflate-raw');
  const writer = cs.writable.getWriter();
  writer.write(inputBytes as unknown as BufferSource);
  writer.close();

  const reader = cs.readable.getReader();
  const chunks: Uint8Array[] = [];
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    if (value) chunks.push(value);
  }

  const totalLength = chunks.reduce((acc, c) => acc + c.length, 0);
  const combined = new Uint8Array(totalLength);
  let offset = 0;
  for (const chunk of chunks) {
    combined.set(chunk, offset);
    offset += chunk.length;
  }

  return uint8ArrayToBase64Url(combined);
}

/**
 * Decompresses a URL-safe Base64 string back into the original UTF-8 Markdown text.
 */
export async function decompressDeck(base64url: string): Promise<string> {
  if (!base64url || typeof base64url !== 'string') return '';

  const compressedBytes = base64UrlToUint8Array(base64url);

  if (typeof DecompressionStream === 'undefined') {
    throw new Error('DecompressionStream is not supported in this environment.');
  }

  const ds = new DecompressionStream('deflate-raw');
  const writer = ds.writable.getWriter();
  writer.write(compressedBytes as unknown as BufferSource);
  writer.close();


  const reader = ds.readable.getReader();
  const chunks: Uint8Array[] = [];
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    if (value) chunks.push(value);
  }

  const totalLength = chunks.reduce((acc, c) => acc + c.length, 0);
  const combined = new Uint8Array(totalLength);
  let offset = 0;
  for (const chunk of chunks) {
    combined.set(chunk, offset);
    offset += chunk.length;
  }

  return new TextDecoder().decode(combined);
}
