<script setup lang="ts">
import { _backgroundColor } from '#tailwind-config/theme';

import type { CardQuestion, QuestionOption } from '~/types/type';

const { user_id } = storeToRefs(useAuthStore());

const cardList = ref()
const currentOptionList = ref<QuestionOption[]>()
const isShowFullWord = ref(false)

cardList.value = await $fetch<CardQuestion[]>(`/api/card/due?user_id=${user_id.value}`, {
    method: "GET",
})
let currentCardIndex = ref(0)
for (let card of cardList.value) {
    $fetch<QuestionOption>(`/api/card/question_option/${card.word}`, {
        method: 'GET'
    }).then((value: QuestionOption) => {
        if (value !== null) {
            card.options = value
            currentOptionList.value = cardList.value[0].options
        }
        for (let option of card.options) {
            option.bg_color = "white"
        }
    })
}

const handleAnswer = (option: QuestionOption) => {
    $fetch(`/api/card/${cardList.value[currentCardIndex.value].id}`, {
        method: 'PUT',
        body: {
            isCorrect: option.isCorrect,
            interval: cardList.value[currentCardIndex.value].interval,
            ease_factor: cardList.value[currentCardIndex.value].ease_factor,
            repetitions: cardList.value[currentCardIndex.value].repetitions
        }
    })
    if (option.isCorrect) {
        option.bg_color = "green"
    } else {
        option.bg_color = "red"
        isShowFullWord.value = true
    }
    setTimeout(() => {
        currentCardIndex.value++
        currentOptionList.value = cardList.value[currentCardIndex.value].options
    }, 1000)
    
}
</script>

<template>
<div v-if="cardList.length" class="w-full flex justify-center pt-10">
    <div class="flex flex-col w-3/4 gap-y-8 max-sm:w-full">
        <div class="grid grid-cols-12 gap-2">
            <UBadge class="col-span-1 justify-center">{{ currentCardIndex }}</UBadge>
            <div class="col-span-10 self-center">
                <UMeter :value="currentCardIndex" :min="0" :max="cardList.length"></UMeter>
            </div>
            <UBadge class="col-span-1 justify-center">{{ cardList.length }}</UBadge>
        </div>
        <UCard>
            <template #header>
                <div class="h-8 text-xl">{{ cardList[currentCardIndex].meaning }}</div>
            </template>

            <div class="flex flex-col">
                <div class="grid grid-cols-2 gap-4">
                    <UButton v-for="(option, idx) in currentOptionList" 
                        class="h-36 flex items-center justify-center text-xl"
                        :key="idx"
                        :style="{'background-color': option.bg_color}"
                        @click="handleAnswer(option)">
                        {{ option.word }}
                    </UButton>
                </div>
            </div>
        </UCard>
    </div>
</div>
<div v-else>
    <div class="w-full flex justify-center pt-10">
        <div class="flex flex-col w-3/4">
            <UAlert
                icon="i-heroicons-command-line"
                color="primary"
                variant="solid"
                title="Nothing to review now!"
                description="You completed review all the words before the deadline."
            />
        </div>
    </div>
</div>
<USlideover v-model="isShowFullWord" prevent-close side="bottom">
      <UCard class="flex flex-col flex-1" :ui="{ body: { base: 'flex-1' }, ring: '', divide: 'divide-y divide-gray-100 dark:divide-gray-800' }">
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="text-base font-semibold leading-6 text-gray-900 dark:text-white">
              Slideover
            </h3>
            <UButton color="gray" variant="ghost" icon="i-heroicons-x-mark-20-solid" class="-my-1" @click="isShowFullWord = false" />
          </div>
        </template>

        <Placeholder class="h-full" />
      </UCard>
    </USlideover>
</template>


<style scoped>
div {
  font-family: "Noto Sans JP", Roboto, sans-serif;
}
</style>