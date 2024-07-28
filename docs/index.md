---
# https://vitepress.dev/reference/default-theme-home-page
layout: home

hero:
  name: "Modular Rest"
  text: "Ultimate Headless CMS for Full Stack Developers"
  tagline: "Kickstart your backend in seconds and focus on building your client application."
  image:
    src: ./assets/hero.png
    alt: Modular Rest
  actions:
    - theme: brand
      text: Get Started
      link: /intro/start
    - theme: alt
      text: Install
      link: /server-client/setup.md
    - theme: alt
      text: GitHub
      link: https://github.com/navidshad/modular-rest

features:
  - title: Authentication (JWT)
    details: Protect your backend app with JSON Web Token authentication, offering various permission levels for enhanced security.
    icon: <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24"><path fill="currentColor" d="M12 0a1.667 1.667 0 0 0-1.666 1.666A1.667 1.667 0 0 0 12 3.334a1.667 1.667 0 0 0 1.666-1.668A1.667 1.667 0 0 0 12 0M9.506 1.145A11.57 11.57 0 0 0 .442 12.317a.716.716 0 0 0 1.075.618a.7.7 0 0 0 .358-.6a10.14 10.14 0 0 1 5.06-8.666a10 10 0 0 1 2.696-1.074a2.55 2.55 0 0 1-.125-1.452Zm8.015 1.26a.71.71 0 0 0-.695.713a.7.7 0 0 0 .34.61a10.13 10.13 0 0 1 4.545 11.587c.314.046.618.15.894.309q.223.127.42.293a11.57 11.57 0 0 0-5.15-13.43a.7.7 0 0 0-.354-.082m-5.519 3.791a6.247 6.247 0 1 0 .002 12.494a6.247 6.247 0 0 0-.002-12.494m0 1.43a4.819 4.819 0 0 1 3.41 8.222a4.817 4.817 0 1 1-3.41-8.222m-.01 2.295c-1.412.014-1.896 1.887-.668 2.584l-.435 2.207a.237.237 0 0 0 .234.281h1.772a.236.236 0 0 0 .234-.281l-.438-2.207a1.38 1.38 0 0 0 .692-1.202a1.38 1.38 0 0 0-1.39-1.382zm-9.324 6.242a1.667 1.667 0 0 0-1.666 1.666a1.667 1.667 0 0 0 1.666 1.668a1.667 1.667 0 0 0 1.666-1.668a1.667 1.667 0 0 0-1.666-1.666m18.664 0a1.667 1.667 0 0 0-1.666 1.666a1.667 1.667 0 0 0 1.666 1.668a1.667 1.667 0 0 0 1.666-1.668a1.667 1.667 0 0 0-1.666-1.666M4.655 19.427a2.5 2.5 0 0 1-.702.608a2.6 2.6 0 0 1-.468.207a11.576 11.576 0 0 0 14.208 2.273a.713.713 0 0 0 0-1.238a.7.7 0 0 0-.703-.012a10.13 10.13 0 0 1-10.052-.05a10.2 10.2 0 0 1-2.283-1.788"/></svg>

  - title: MongoDB
    details: Utilize MongoDB directly within your client app, simplifying database interactions.
    icon: <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 256 256"><g fill="none"><rect width="256" height="256" fill="#023430" rx="60"/><path fill="#10aa50" d="M171.173 107.591c-10.537-46.481-32.497-58.855-38.099-67.602A99 99 0 0 1 126.949 28c-.296 4.13-.84 6.73-4.35 9.862c-7.047 6.283-36.977 30.673-39.496 83.486c-2.347 49.242 36.2 79.605 41.292 82.744c3.916 1.927 8.685.041 11.012-1.728c18.581-12.752 43.969-46.75 35.786-94.773"/><path fill="#b8c4c2" d="M128.545 177.871c-.97 12.188-1.665 19.27-4.129 26.235c0 0 1.617 11.603 2.753 23.894h4.019a224 224 0 0 1 4.384-25.732c-5.203-2.56-6.827-13.702-7.027-24.397"/><path fill="#12924f" d="M135.565 202.275c-5.258-2.429-6.779-13.806-7.013-24.404a500 500 0 0 0 1.136-52.545c-.276-9.194.13-85.158-2.265-96.28a92 92 0 0 0 5.651 10.936c5.602 8.754 27.569 21.128 38.099 67.609c8.203 47.941-17.047 81.849-35.608 94.684"/></g></svg>

  - title: Custom Routes
    details: Create custom APIs for your specific use cases. Modular Rest provides a scalable base for your development needs.
    icon: <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 32 32"><path fill="currentColor" d="M17 18.184v-4.368a3 3 0 1 0-2 0v4.369a3 3 0 1 0 2 0ZM16 10a1 1 0 1 1-1 1a1 1 0 0 1 1-1m0 12a1 1 0 1 1 1-1a1 1 0 0 1-1 1"/><path fill="currentColor" d="M30.414 17.414a2 2 0 0 0 0-2.828l-5.787-5.787l2.9-2.862a2.002 2.002 0 1 0-1.44-1.388l-2.874 2.836l-5.799-5.8a2 2 0 0 0-2.828 0L8.799 7.374L5.937 4.472A2.002 2.002 0 1 0 4.55 5.914l2.835 2.873l-5.8 5.799a2 2 0 0 0 0 2.828l5.8 5.799l-2.835 2.873a1.998 1.998 0 1 0 1.387 1.442l2.862-2.9l5.787 5.786a2 2 0 0 0 2.828 0l5.8-5.799l2.872 2.836a1.998 1.998 0 1 0 1.442-1.387l-2.9-2.863ZM16 29L3 16L16 3l13 13Z"/></svg>

  - title: Server functions
    details: Develop and integrate server functions seamlessly, enabling clients to run functions directly and enhance backend capabilities.
    icon: <svg xmlns="http://www.w3.org/2000/svg" width="1.11em" height="1em" viewBox="0 0 256 231"><defs><path id="logosGoogleCloudFunctions0" d="M252.926 103.237L200.327 11.76A23.12 23.12 0 0 0 180.607 0H75.392a23.1 23.1 0 0 0-19.72 11.76L3.053 102.997a22.96 22.96 0 0 0 0 22.88l52.598 91.997a23.54 23.54 0 0 0 19.72 12.18h105.217a23.46 23.46 0 0 0 19.74-12.12l52.598-91.478a23.46 23.46 0 0 0 0-23.219"/></defs><mask id="logosGoogleCloudFunctions1" fill="#fff"><use href="#logosGoogleCloudFunctions0"/></mask><path fill="#4285f4" d="M252.926 103.237L200.327 11.76A23.12 23.12 0 0 0 180.607 0H75.392a23.1 23.1 0 0 0-19.72 11.76L3.053 102.997a22.96 22.96 0 0 0 0 22.88l52.598 91.997a23.54 23.54 0 0 0 19.72 12.18h105.217a23.46 23.46 0 0 0 19.74-12.12l52.598-91.478a23.46 23.46 0 0 0 0-23.219" mask="url(#logosGoogleCloudFunctions1)"/><path d="m187.168 84.732l-7.252 7.909l1.633 46.998l-6.873 9.961l-3.985-3.984h3.666v-16.297l-17.592-17.592l-13.296 6.646l-44.101-44.2L78.13 85.548l-2.63 22.035l7.452 40.324l10.798 10.579l-4.921 6.993l64.247 65.758h26.84c8.223-.282 17.128-5.671 21.1-12.877l43.78-76.003z" mask="url(#logosGoogleCloudFunctions1)" opacity="0.07"/><path fill="#fff" d="m88.829 165.479l10.539-10.54l-15.799-15.798v-49.17l15.799-15.798l-10.539-10.54l-21.098 21.099v59.648z" mask="url(#logosGoogleCloudFunctions1)"/><circle cx="105.145" cy="114.556" r="7.471" fill="#fff" mask="url(#logosGoogleCloudFunctions1)"/><circle cx="127.499" cy="114.556" r="7.471" fill="#fff" mask="url(#logosGoogleCloudFunctions1)"/><circle cx="149.852" cy="114.556" r="7.471" fill="#fff" mask="url(#logosGoogleCloudFunctions1)"/><path fill="#fff" d="m166.069 63.633l-10.539 10.54l15.799 15.798v49.17l-15.799 15.798l10.539 10.54l21.099-21.099V84.732z" mask="url(#logosGoogleCloudFunctions1)"/></svg>

  - title: Client Library
    details: Use our client library to facilitate communication with your server app, offering a Firebase-like experience that’s even easier to use.
    icon: <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24"><path fill="currentColor" d="M21.4 7.5c.8.8.8 2.1 0 2.8l-2.8 2.8l-7.8-7.8l2.8-2.8c.8-.8 2.1-.8 2.8 0l1.8 1.8l3-3l1.4 1.4l-3 3zm-5.8 5.8l-1.4-1.4l-2.8 2.8l-2.1-2.1l2.8-2.8l-1.4-1.4l-2.8 2.8l-1.5-1.4l-2.8 2.8c-.8.8-.8 2.1 0 2.8l1.8 1.8l-4 4l1.4 1.4l4-4l1.8 1.8c.8.8 2.1.8 2.8 0l2.8-2.8l-1.4-1.4z"/></svg>
---

<style >
:root {
  --vp-home-hero-name-color: transparent !important;
  --vp-home-hero-name-background: -webkit-linear-gradient(120deg, #bd34fe 30%, #41d1ff) !important;

  /* --vp-home-hero-image-background-image: linear-gradient(-45deg, rgba(189, 52, 254, 0.2) 50%, rgba(71, 202, 255, 0.2) 50%) !important;
  --vp-home-hero-image-filter: blur(44px) !important; */

}

.VPHero .text {
  font-size: 2.5rem !important;
  line-height: normal !important;
}



@media (min-width: 640px) {
  :root {
    --vp-home-hero-image-filter: blur(56px);
  }
}

@media (min-width: 960px) {
  :root {
    --vp-home-hero-image-filter: blur(68px);
  }
}
</style>

