<script setup lang="ts">

const links = [[{
  label: 'Installation',
  icon: 'i-heroicons-home',
  to: '/'
}, {
  label: 'Horizontal Navigation',
  icon: 'i-heroicons-chart-bar',
  to: '/'
}, {
  label: 'Command Palette',
  icon: 'i-heroicons-command-line',
  to: '/'
}],
[{
  label: 'Profile',
  avatar: {
    src: 'https://avatars.githubusercontent.com/u/739984?v=4'
  },
  badge: 100
}]

]
</script>

<template>
  <UHorizontalNavigation :links="links" class="border-b border-gray-200 dark:border-gray-800" />
  <slot></slot>
</template>

