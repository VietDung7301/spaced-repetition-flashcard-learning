<script setup lang="ts">
const { username, userAvatar } = storeToRefs(useAuthStore())

const links = [[{
  label: 'Home',
  icon: 'i-heroicons-home',
  to: '/'
}, {
  label: 'Add new set',
  icon: 'i-material-symbols:add-card-outline-rounded',
  to: '/add-set'
}, {
  label: 'Add new word',
  icon: 'i-material-symbols:add-circle-outline',
  to: '/add-word'
}],
[{
  label: username,
  to: '/profile',
}, {
  label: 'Logout',
  icon: 'i-solar:logout-2-linear',
  to: '/logout'
}]

]
</script>

<template>
  <UHorizontalNavigation :links="links" class="border-b border-gray-200 dark:border-gray-800">
    <template #avatar="{ link }">
      <UAvatar
        v-if="link.to === '/profile'"
        size="sm"
        :src=userAvatar
      />
    </template>
  </UHorizontalNavigation>
  <slot></slot>
</template>

