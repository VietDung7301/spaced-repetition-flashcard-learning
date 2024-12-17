<script setup lang="ts">
import type { CardSet, Card } from '~/types/type';
const { user_id } = storeToRefs(useAuthStore());
const { id: setId } = useRoute().params

const setList = await $fetch<CardSet[]>(`/api/card_set?user_id=${user_id.value}`, {
    method: "GET",
})

const cardList = await $fetch<Card[]>(`/api/card_set/${setId}`, {
    method: "GET",
})

</script>

<template>
<!-- Dropdown menu -->
    <div class="overflow-x-auto hide-scroll-bar m-2 pb-5">
        <div class="flex flex-nowrap">
            <div v-for="set in setList" class="w-1/3 p-3">
                <UCard class="flex flex-col justify-center hover:cursor-pointer" @click="navigateTo(`/set/${set.id}`)">
                    <UIcon name="i-material-symbols:folder" class="w-5 h-5" />
                    <p class="text-xl">{{ set.name }}</p>
                </UCard>
            </div>
        </div>
    </div>
    <div class="m-5 grid grid-cols-1 gap-4">
        <div v-for="card in cardList">
            <UCard class="min-w-48 w-1/2 mr-2 min-h-36">
                <div class="text-lg font-bold">{{ card.word }}</div>
                <div class="flex flex-wrap justify-between">
                    <div class="pr-5">{{ card.pronunciation }}</div>
                    <div class="content-center">{{ card.meaning }}</div>
                </div>
                <div class="italic">{{ card.example }}</div>
            </UCard>
        </div>
    </div>
</template>