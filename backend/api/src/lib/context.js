import { AsyncLocalStorage } from "async_hooks";

export const requestContext = new AsyncLocalStorage();

export function getRequestId() {
  const store = requestContext.getStore();
  return store?.requestId || null;
}

export function getUserId() {
  const store = requestContext.getStore();
  return store?.userId || null;
}
