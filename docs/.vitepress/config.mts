import { defineConfig } from "vitepress";

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "Modular Rest",
  description:
    "A set of libraries to bring database access into client side (web/mobile) except bother yourself by developing backend side. ",
  base: "/modular-rest/",
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: "Home", link: "/" },
      { text: "Examples", link: "/markdown-examples" },
    ],

    sidebar: [
      {
        text: "Introduction",
        items: [{ text: "Get Started", link: "/intro/start" }],
      },
      {
        text: "Server",
        items: [
          { text: "Installation", link: "/server-client/setup" },
          { text: "Key Concepts", link: "/server-client/key-concepts" },
          { text: "Configuration", link: "/server-client/configuration" },
          {
            text: "Models",
            items: [
              { text: "Intro", link: "/server-client/modules/intro" },
              { text: "Database", link: "/server-client/modules/database" },
              { text: "Functions", link: "/server-client/modules/functions" },
              {
                text: "Custom Route",
                link: "/server-client/modules/custom-route",
              },
            ],
          },
          {
            text: "Utilities",
            items: [
              { text: "Utilities", link: "/server-client/utilities/index" },
            ],
          },
          {
            text: "Advanced Topics",
            items: [{ text: "Cors", link: "/server-client/advanced/cors" }],
          },
        ],
      },
      {
        text: "JS Client",
        items: [
          { text: "Install", link: "/js-client/install" },
          { text: "Authentication", link: "/js-client/authentication" },
          { text: "Data Provider", link: "/js-client/data-provider" },
          { text: "file Provider", link: "/js-client/file-provider" },
        ],
      },
      {
        text: "Flutter Client",
        items: [{ text: "Install", link: "/flutter-client/install" }],
      },
      {
        text: "Http Api",
        items: [{ text: "Intro", link: "/http-api/intro" }],
      },
    ],

    socialLinks: [
      { icon: "github", link: "https://github.com/navidshad/modular-rest" },
    ],
  },
});
