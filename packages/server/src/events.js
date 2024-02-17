const eventCallbacks = [];
/**
 * onBeforeInit: (koaApp:Koa) => void; // A callback called before initializing the Koa server.
 * onAfterInit: (koaApp:Koa) => void; // A callback called after server initialization.
 * onNewUser:
 */

function registerEventCallback(event, callback) {
  if (typeof event !== "string") throw new Error("Event must be a string");

  if (typeof callback !== "function")
    throw new Error("Callback must be a function");

  eventCallbacks.push({ event, callback });
}
