# Modules
Modules are the building blocks your logics on top of modular-rest. each module has a specific directory and all relevant files and data structure are placed in that directory. hence you can add unlimited modules to your project and scale it as much as you want.

## Structure
All modules should be placed in the `modules` directory that you define and [introduce in the configuration object](./../quick-start.md#modules-path). Each module should have its own directory with the following structure, and all files should be placed in that directory but none of theme are required.

- `db.js`: to define the database models and their relationships.
- `functions`: to define functions that you want to be invoked by client library.
- `router.js`: to define the routes and their handlers.

You can add more files and directories to your module based on your needs, but the above files are be recognized by modular-rest and will be imported to the server logic automatically on startup.

## Use Cases
Let's see some examples to understand the concept of modules better.

#### **Blog Website**:
Assume you want to create a blog website where people come and write their own blog posts, read other people's posts, and comment on them.

To modularize this project, you can create three modules: 
- `users`: to manage users and their profiles.
- `posts`: to manage blog posts and their categories, tags, and content.
- `comments`: to manage comments on blog posts and their replies.

#### **E-commerce Website**:
Assume you want to create an e-commerce website where people come and buy products, add them to their cart, and pay for them.

To modularize this project, you can create three modules: 
- `users`: to manage users and their profiles.
- `products`: to manage products and their categories, prices, and descriptions.
- `orders`: to manage orders and their statuses, like pending, shipped, and delivered.

#### **Video Editing Platform**:
Assume you want to create a video editing platform where people come and upload their videos, edit them, and share them with others.

To modularize this project, you can create three modules: 
- `users`: to manage users and their profiles.
- `media-library`: to manage media files like videos, images, and audio files.
- `editor-engine`: to manage the video editing process, like trimming, cropping, and adding effects to the videos.



