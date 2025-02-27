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
    padding: 1rem;
    border: 1px solid #7a7a7a;
    border-radius: 0.5rem;
  }
</style>