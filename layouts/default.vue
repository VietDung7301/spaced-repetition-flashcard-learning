<script setup lang="ts">
const { username, userAvatar } = storeToRefs(useAuthStore())
const colorMode = useColorMode()

const isDark = computed({
  get () {
    return colorMode.value === 'dark'
  },
  set () {
    colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark'
  }
})

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
}, {
  label: "Review",
  icon: "i-hugeicons:online-learning-01",
  to: "/review/vocabulary"
}],
[{
  icon: 'i-heroicons-sun-20-solid',
  click: () => isDark.value = !isDark
},{
  label: username,
  to: '/profile',
}, {
  icon: 'i-solar:logout-2-linear',
  to: '/logout'
}]

]
</script>

<template>
  <div class="min-h-screen bg-gradient-to-tr from-slate-50 via-sky-50 to-pink-100
        dark:from-slate-900 dark:via-gray-800 dark:to-sky-900">
    <UHorizontalNavigation :links="links" class="border-b border-gray-200 dark:border-gray-800">
      <template #avatar="{ link }">
        <UAvatar
          v-if="link.to === '/profile'"
          size="sm"
          :src=userAvatar
        />
      </template>
    </UHorizontalNavigation>
    <div class="">
      <slot></slot>
    </div>
  </div>
</template>
