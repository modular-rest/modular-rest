import DefaultTheme from "vitepress/theme";
import RawLayout from "./RawLayout.vue";

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component("raw", RawLayout);
  },
};
