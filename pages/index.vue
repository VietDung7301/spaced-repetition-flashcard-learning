<script setup lang="ts">
import type { CardSet, Card } from '~/types/type';
const { user_id } = storeToRefs(useAuthStore());

const setList = await $fetch<CardSet[]>(`/api/card_set?user_id=${user_id.value}`, {
    method: "GET",
})

const cardList = await $fetch<Card[]>(`/api/card/due?user_id=${user_id.value}`, {
    method: "GET",
})
</script>

<template>
    <div class="pt-10 px-20 max-sm:px-5">
        <div class="space-y-4">
            <p class="text-2xl font-bold">Learning Sets</p>
            <div class="grid grid-cols-4 max-sm:grid-cols-2 gap-4">
                <div v-for="set in setList" class="basis-1/4">
                    <UCard class="flex flex-col justify-center">
                        <UIcon name="i-material-symbols:folder" class="w-5 h-5" />
                        <p class="text-xl">{{ set.name }}</p>
                    </UCard>
                </div>
            </div>
        </div>
        <UDivider class="h-10"/>
        <div class="space-y-4">
            <div>
                <p class="text-2xl font-bold">Need to review</p>
            </div>
            <div class="grid grid-cols-4 max-sm:grid-cols-2 gap-4">
                <div v-for="card in cardList" class="basis-1/4">
                    <UCard class="flex flex-col justify-center">
                        <p class="h-40 content-center text-center text-xl">{{ card.word }}</p>
                    </UCard>
                </div>
            </div>
        </div>
    </div>
</template>
