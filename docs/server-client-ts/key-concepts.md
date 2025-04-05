# Key Concepts
Modular-rest is designed to minimize the amount of code needed to create a RESTful backend. With just a single call to the `createRest` function, you can have a fully functional RESTful backend up and running. To make it flexible and customizable, modular-rest introduces several key concepts that you should understand to effectively build your own logic on top of it.

## Configuration
The configuration object passed to the `createRest` function is the foundation of modular-rest. This object contains all the necessary information for modular-rest to set up the server. You can learn more about configuring your server in the [Quick Start](./quick-start.md) section.

## Modules
Modules are the building blocks for implementing your business logic on top of modular-rest. Each module has its own dedicated directory where all relevant files and data structures are organized. This modular approach allows you to add unlimited modules to your project and scale it according to your needs. Learn more about working with modules in the [Modules](./modules/intro.md) section.