import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "Modular Rest",
  description: "A set of libraries to bring database access into client side (web/mobile) except bother yourself by developing backend side. ",
  base: "/modular-rest/",
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Examples', link: '/markdown-examples' }
    ],

    sidebar: [
      {
        text: 'Introduction',
        items: [
          { text: 'Get Started', link: '/intro/start' },
        ]
      },
      {
        text: 'Server',
        items: [
          { text: 'Install', link: '/server-client/install' },
          { text: 'Database', link: '/server-client/database' },
          { text: 'File Manager', link: '/server-client/file-manager' },
          { text: 'Custom Route', link: '/server-client/custom-route' },
          { text: 'Cors', link: '/server-client/cors' },
          { text: 'Otp', link: '/server-client/otp' },
        ]
      },
      {
        text: 'JS Client',
        items: [
          { text: 'Install', link: '/js-client/install' },
        ]
      },
      {
        text: 'Flutter Client',
        items: [
          { text: 'Install', link: '/flutter-client/install' },
        ]
      }
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/navidshad/modular-rest' }
    ]
  }
})
