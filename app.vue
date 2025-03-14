<script setup lang="ts">
useHead({
  title: 'Flashcard',
})
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
  <UNotifications />
</template>

<style>
  div {
    font-family: "Noto Sans JP", Roboto, sans-serif;
  }
  .tiptap {
    padding-top: 0.375rem;
    padding-bottom: 0.375rem;
    padding-left: 0.625rem;
    padding-right: 0.625rem;
    border-top: 1px solid rgba(209, 213, 219, 1);
    border-radius: 0.5rem;
    border-top-left-radius: 0;
    border-top-right-radius: 0;
    background-color: rgba(243, 244, 246, 1);
    white-space: pre-wrap;
  }
  
  :root.dark .tiptap {
    border-top: 1px solid rgba(55, 65, 81, 1);
    background-color: rgba(31, 41, 55, 1);
  }
</style>