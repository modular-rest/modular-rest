import Koa from "koa";

/**
 * Event callback interface
 */
interface EventCallback {
  event: string;
  callback: (...args: any[]) => void;
}

/**
 * Array to store all registered event callbacks
 */
const eventCallbacks: EventCallback[] = [];

/**
 * Supported event types:
 * - onBeforeInit: (koaApp: Koa) => void; // A callback called before initializing the Koa server.
 * - onAfterInit: (koaApp: Koa) => void; // A callback called after server initialization.
 * - onNewUser: (user: any) => void; // A callback called when a new user is created.
 *
 * @param event - The event name to register
 * @param callback - The callback function to be called when the event is triggered
 * @throws Error if event is not a string or callback is not a function
 */
export function registerEventCallback(
  event: string,
  callback: (...args: any[]) => void
): void {
  if (typeof event !== "string") throw new Error("Event must be a string");

  if (typeof callback !== "function")
    throw new Error("Callback must be a function");

  eventCallbacks.push({ event, callback });
}

/**
 * Get all registered callbacks for a specific event
 * @param event - The event name to get callbacks for
 * @returns Array of callbacks registered for the event
 */
export function getEventCallbacks(event: string): ((...args: any[]) => void)[] {
  return eventCallbacks
    .filter((cb) => cb.event === event)
    .map((cb) => cb.callback);
}

/**
 * Trigger an event with arguments
 * @param event - The event name to trigger
 * @param args - Arguments to pass to the callback functions
 */
export function triggerEvent(event: string, ...args: any[]): void {
  const callbacks = getEventCallbacks(event);
  for (const callback of callbacks) {
    callback(...args);
  }
}
