<template>
  <div class="raw-layout">
    <div class="raw-container">
      <div class="content-wrapper">
        <div class="raw-content" ref="contentRef">
          <Content />
        </div>
      </div>
      <div class="copy-button-wrapper">
        <button class="copy-button" @click="copyContent" :class="{ copied }">
          {{ copied ? "Copied!" : "Copy" }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, defineProps } from "vue";
import { useData } from "vitepress";

const contentRef = ref(null);
const copied = ref(false);
const { frontmatter } = useData();

const copyContent = () => {
  if (!contentRef.value) return;

  // Get text content from the slot
  const content = contentRef.value.innerText || contentRef.value.textContent;

  // Copy to clipboard
  navigator.clipboard
    .writeText(content)
    .then(() => {
      copied.value = true;
      setTimeout(() => {
        copied.value = false;
      }, 2000);
    })
    .catch((err) => {
      console.error("Failed to copy: ", err);
    });
};

onMounted(() => {
  // Check if we want to display raw source instead of rendered content
  const showSource = frontmatter.value.showSource !== false;

  if (showSource && contentRef.value) {
    // For raw source content when available
    const sourceElement = document.querySelector(".vp-doc");
    if (sourceElement) {
      contentRef.value.setAttribute("aria-label", "Source content");
    }
  }
});
</script>

<style scoped>
.raw-layout {
  max-width: 960px;
  margin: 0 auto;
  padding: 20px;
}

.raw-container {
  position: relative;
  background-color: #f5f5f5;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.content-wrapper {
  position: relative;
  overflow-x: auto;
  padding: 20px;
  font-family: "SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace;
  white-space: pre-wrap;
  word-break: break-word;
}

.raw-content {
  font-size: 14px;
  line-height: 1.6;
  color: #333;
}

.raw-content :deep(code) {
  font-family: inherit;
  background-color: rgba(0, 0, 0, 0.05);
  padding: 0.2em 0.4em;
  border-radius: 3px;
}

.raw-content :deep(pre) {
  background-color: rgba(0, 0, 0, 0.05);
  padding: 1em;
  overflow-x: auto;
  border-radius: 6px;
}

.copy-button-wrapper {
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 10;
}

.copy-button {
  background-color: #eee;
  border: none;
  border-radius: 4px;
  padding: 6px 12px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
}

.copy-button:hover {
  background-color: #ddd;
}

.copy-button.copied {
  background-color: #42b983;
  color: white;
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .raw-container {
    background-color: #1a1a1a;
  }

  .raw-content {
    color: #eee;
  }

  .raw-content :deep(code) {
    background-color: rgba(255, 255, 255, 0.1);
  }

  .raw-content :deep(pre) {
    background-color: rgba(255, 255, 255, 0.05);
  }

  .copy-button {
    background-color: #333;
    color: #eee;
  }

  .copy-button:hover {
    background-color: #444;
  }
}
</style>
