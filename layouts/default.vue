<script setup lang="ts">
const { userAvatar, isVoiceOffline } = storeToRefs(useAuthStore())
const { changeVoiceUrl } = useAuthStore()
import { Disclosure, DisclosureButton, DisclosurePanel, Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/vue'
const colorMode = useColorMode()

const isDark = computed({
  get () {
    return colorMode.value === 'dark'
  },
  set () {
    colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark'
  }
})

const currentPath = computed(() => {
  const route=useRoute()
  return route.path
})

const navigation = [
  { name: 'Add set', href: '/add/set', current: currentPath.value === '/add/set' ? true : false },
  { name: 'Add card', href: '/add/card', current: currentPath.value === '/add/card' ? true : false },
  { name: 'Review vocabulary', href: '/review/vocabulary', current: currentPath.value === '/review/vocabulary' ? true : false },
  { name: 'Review grammar', href: '/review/grammar', current: currentPath.value === '/review/grammar' ? true : false },
  { name: 'Review kanji', href: '/review/kanji', current: currentPath.value === '/review/kanji' ? true : false },
]
</script>

<template>
  <div class="min-h-screen bg-gradient-to-tr from-slate-50 via-sky-50 to-pink-100
        dark:from-slate-900 dark:via-gray-800 dark:to-sky-900">
        <Disclosure as="nav" class="bg-gray-800 sticky top-0 z-50" v-slot="{ open }">
    <div class="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8">
      <div class="relative flex h-16 items-center justify-between">
        <div class="absolute inset-y-0 left-0 flex items-center sm:hidden">
          <!-- Mobile menu button-->
          <DisclosureButton class="relative inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-700 hover:text-white focus:ring-2 focus:ring-white focus:outline-hidden focus:ring-inset">
            <span class="absolute -inset-0.5" />
            <span class="sr-only">Open main menu</span>
            <UIcon name="i-heroicons:bars-3" v-if="!open" class="block size-6" aria-hidden="true" />
            <UIcon name="i-heroicons:x-mark" v-else class="block size-6" aria-hidden="true" />
          </DisclosureButton>
        </div>
        <div class="flex flex-1 items-center justify-center sm:items-stretch sm:justify-start">
          <div class="flex shrink-0 items-center">
            <ULink to="/">
              <img class="h-8 w-auto" src="/favicon.ico" alt="Keep learning" />
            </ULink>
          </div>
          <div class="hidden sm:ml-6 sm:block" :key="currentPath">
            <div class="flex space-x-4">
              <ULink v-for="item in navigation" 
                :key="item.name" 
                :to="item.href"
                active-class='bg-gray-900 text-white'
                
                inactive-class='text-gray-300 hover:bg-gray-700 hover:text-white'
                :class="['rounded-md px-3 py-2 text-sm font-medium']" 
                :aria-current="item.current ? 'page' : undefined">
                {{ item.name }}
              </ULink>
            </div>
          </div>
        </div>
        <div class="absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0">
          <!-- Voice button -->
          <UButton
            :icon="isVoiceOffline ? 'i-famicons:cloud-offline-outline' : 'i-famicons:cloud-done'"
            color="gray"
            variant="ghost"
            aria-label="Voice"
            @click="changeVoiceUrl()"
            class="size-8"
          />
          <UButton
            :icon="isDark ? 'i-heroicons-moon-20-solid' : 'i-heroicons-sun-20-solid'"
            color="gray"
            variant="ghost"
            aria-label="Theme"
            @click="isDark = !isDark"
            class="size-8"
          />

          <!-- Profile dropdown -->
          <Menu as="div" class="relative ml-3">
            <div>
              <MenuButton class="relative flex rounded-full bg-gray-800 text-sm focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800 focus:outline-hidden">
                <span class="absolute -inset-1.5" />
                <span class="sr-only">Open user menu</span>
                <img class="size-8 rounded-full" :src="userAvatar" />
              </MenuButton>
            </div>
            <transition enter-active-class="transition ease-out duration-100" enter-from-class="transform opacity-0 scale-95" enter-to-class="transform opacity-100 scale-100" leave-active-class="transition ease-in duration-75" leave-from-class="transform opacity-100 scale-100" leave-to-class="transform opacity-0 scale-95">
              <MenuItems class="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 ring-1 shadow-lg ring-black/5 focus:outline-hidden">
                <MenuItem v-slot="{ active }">
                  <ULink to="/logout" :class="[active ? 'bg-gray-100 outline-hidden' : '', 'block px-4 py-2 text-sm text-gray-700']">Sign out</ULink>
                </MenuItem>
              </MenuItems>
            </transition>
          </Menu>
        </div>
      </div>
    </div>

    <DisclosurePanel class="sm:hidden" :key="currentPath">
      <div class="space-y-1 px-2 pt-2 pb-3">
        <DisclosureButton v-for="item in navigation" :key="item.name" as="a" :href="item.href" :class="[item.current ? 'bg-gray-900 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white', 'block rounded-md px-3 py-2 text-base font-medium']" :aria-current="item.current ? 'page' : undefined">{{ item.name }}</DisclosureButton>
      </div>
    </DisclosurePanel>
  </Disclosure>


    <div class="">
      <slot></slot>
    </div>
  </div>
</template>

