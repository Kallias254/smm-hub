import { Payload } from 'payload';

let globalPayload: Payload | null = null;

export function setGlobalPayload(payload: Payload) {
  globalPayload = payload;
}

export function getGlobalPayload(): Payload {
  if (!globalPayload) {
    throw new Error('Payload has not been initialized in this worker process.');
  }
  return globalPayload;
}
