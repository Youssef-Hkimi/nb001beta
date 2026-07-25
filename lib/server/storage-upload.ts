import "server-only";

export function bufferToStorageBlob(buffer: Buffer, contentType: string) {
  return new Blob([Uint8Array.from(buffer)], {type: contentType});
}
