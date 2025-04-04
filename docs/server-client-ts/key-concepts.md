# Key Concepts
Modular-rest is all about minimizing the amount of code you have to write to create a RESTful backend. then it can be don just by calling `createRest` function, and then you will have a fully functional RESTful backend. but to make it more flexible and customizable, modular-rest has some key concepts that you should know about them to be able to implement your own logic on top of modular-rest.

## Configuration
The most important part of modular-rest is the configuration object that you pass to `createRest` function. this object contains all the information that modular-rest needs to setup the server. you can read more about the configuration object in the [Quick start](./quick-start.md) section.

## Modules
Modules are the building blocks your logics on top of modular-rest. each module has a specific directory and all relevant files and data structure are placed in that directory. hence you can add unlimited modules to your project and scale it as much as you want. you can read more about modules in the [Modules](./modules/intro.md) section.