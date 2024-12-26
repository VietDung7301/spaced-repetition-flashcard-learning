<script setup lang="ts">
import type { CardSet, Card } from '~/types/type';
const { user_id } = storeToRefs(useAuthStore());

const setList = await $fetch<CardSet[]>(`/api/card_set?user_id=${user_id.value}`, {
    method: "GET",
})

const cardList = await $fetch<Card[]>(`/api/card/due?user_id=${user_id.value}`, {
    method: "GET",
})

const isEdit = false;

const items = [
  [{
    label: 'Profile',
    avatar: {
      src: 'https://avatars.githubusercontent.com/u/739984?v=4'
    }
  }]
]
</script>

<template>
<!-- Dropdown menu -->
    <div class="overflow-x-auto hide-scroll-bar m-2 pb-5">
        <div class="flex flex-nowrap">
            <div v-for="set in setList" class="w-1/3 p-3">
                <UCard class="flex flex-col justify-center hover:bg-sky-200 active:bg-sky-300 focus:outline-none focus:ring focus:ring-sky-300">
                    <UIcon name="i-material-symbols:folder" class="w-5 h-5" />
                    <p class="text-xl">{{ set.name }}</p>
                </UCard>
            </div>
        </div>
    </div>
    <div class="m-5 grid grid-cols-1 gap-4">
        <div v-for="card in cardList" class="flex flex-row">
            <UCard class="min-w-48 w-1/2 mr-2 min-h-36">
                <div class="text-lg font-bold">{{ card.word }}</div>
                <div class="flex flex-wrap justify-between">
                    <div class="text-gray-900 pr-5">{{ card.pronunciation }}</div>
                    <div class="text-gray-900 content-center">{{ card.meaning }}</div>
                </div>
                <div class="italic">{{ card.example }}</div>
            </UCard>
            <div class="w-24 mr-2 min-h-36 grid grid-col-2">
                <UButton icon="mingcute:pencil-2-line" class="mb-2 ml-2" @click="isEdit = !isEdit">Edit</UButton>
                <UButton icon="mingcute:delete-2-line" color="red" class="mt-2 ml-2">Delete</UButton>
            </div>
        </div>
    </div>
</template>