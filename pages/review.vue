<script setup lang="ts">
import type { CardQuestion } from '~/types/type';

const { user_id } = storeToRefs(useAuthStore());

const cardList = await $fetch<CardQuestion[]>(`/api/card/due?user_id=${user_id.value}`, {
    method: "GET",
})

for (let card of cardList) {
    card.questions = await $fetch(`/api/card/question_option/${card.word}`), {
        method: 'GET'
    }
}

let currentCardIndex = 0
</script>

<template>
<div class="w-full flex justify-center pt-10">
    <div class="flex flex-col w-3/4">
        <div class="grid grid-cols-12 gap-2">
            <UBadge class="col-span-1 self-center">{{ currentCardIndex }}</UBadge>
            <div class="col-span-10 self-center">
                <UMeter :value="currentCardIndex" :min="0" :max="cardList.length"></UMeter>
            </div>
            <UBadge class="col-span-1 self-center">{{ cardList.length }}</UBadge>
        </div>
        <div class="flex flex-col">
            <div>{{ cardList[currentCardIndex].meaning }}</div>
            <div class="grid grid-cols-2 gap-4">
                <UButton v-for="option in cardList[currentCardIndex].questions" class="h-36 flex items-center justify-center">
                    {{ option.word }}
                </UButton>
            </div>
        </div>
    </div>
</div>
</template>