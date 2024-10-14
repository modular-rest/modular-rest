/**
 * onBeforeInit: (koaApp:Koa) => void; // A callback called before initializing the Koa server.
 * onAfterInit: (koaApp:Koa) => void; // A callback called after server initialization.
 * onNewUser:
 */
declare function registerEventCallback(event: any, callback: any): void;
declare const eventCallbacks: any[];
