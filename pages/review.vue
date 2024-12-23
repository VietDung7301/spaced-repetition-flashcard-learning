<script setup lang="ts">
import { _backgroundColor } from '#tailwind-config/theme';
import { GoogleGenerativeAI } from "@google/generative-ai";
import type { CardQuestion, QuestionOption } from '~/types/type';

const genAI = new GoogleGenerativeAI(useRuntimeConfig().public.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

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
    }
    setTimeout(() => {
        isShowFullWord.value = true
    }, 200)
}

const handleNextCard = () => {
    isShowFullWord.value = false
    currentCardIndex.value++
    if (currentCardIndex.value < cardList.value.length) {
        currentOptionList.value = cardList.value[currentCardIndex.value].options
        model.generateContent(`Hãy cho tôi 2 ví dụ về cách sử dụng câu có từ ${cardList.value[currentCardIndex.value].word} bằng tiếng Nhật.
                                Hãy chỉ gửi cho tôi ví dụ của bạn và không nhắn thêm bất cứ điều gì.
                                Câu trả lời được viết dưới dạng: 
                                    1. Câu tiếng Nhật  Cách đọc  Ý nghĩa tiếng Việt.
                                    2. Câu tiếng Nhật  Cách đọc  Ý nghĩa tiếng Việt.
                                Trong đó, cách dọc được viết dưới dạng chữ hiragana. 
                                Ví dụ, chữ "勉強" khi được viết dưới dạng hiragana sẽ là "べんきょう" mà không phải là "benkyou".`
        ).then((value: any) => {
            cardList.value[currentCardIndex.value].exampleAI = value.response.text().replaceAll("\n\n", "\n")
        })
    }
}

defineShortcuts({
  escape: {
    usingInput: true,
    whenever: [isShowFullWord],
    handler: () => { 
        isShowFullWord.value = false
        currentCardIndex.value++
        currentOptionList.value = cardList.value[currentCardIndex.value].options
    }
  }
})
</script>

<template>
<div v-if="cardList?.length > currentCardIndex" class="w-full flex justify-center pt-10">
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
                        class="h-36 flex items-center justify-center text-xl text-black"
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
<USlideover v-model="isShowFullWord" side="bottom" :overlay="false">
    <UCard class="flex flex-col flex-1" :ui="{ body: { base: 'flex-1' }, ring: '', divide: 'divide-y divide-gray-100 dark:divide-gray-800' }">
        <template #header>
          <div class="flex items-center justify-between">
            <div class="text-base dark:text-3xl dark:text-green-400 mb-2">{{ cardList[currentCardIndex].word }}</div>
            <UButton icon="i-material-symbols:keyboard-double-arrow-right-rounded" @click="handleNextCard">
                Next
            </UButton>
          </div>
        </template>

        <div clsss="grid grid-cols-2 gap-4 overflow-y-scroll">
            <div class="">
                <div class="text-xl">{{ cardList[currentCardIndex].pronunciation }}</div>
                <div class="text-xl">{{ cardList[currentCardIndex].meaning }}</div>
            </div>
            <UDivider class="h-4"/>
            <div class="">
                <div v-if="cardList[currentCardIndex].example">
                    <div class="text-green-400"><UIcon class="text-inherit" name="i-mdi:arrow-expand-right"/> Example</div>
                    <div class="whitespace-pre-wrap">{{cardList[currentCardIndex].example}}</div>
                </div>
                <div v-if="cardList[currentCardIndex].exampleAI">
                    <div class="text-green-400"><UIcon class="text-inherit" name="i-mdi:arrow-expand-right"/> AI generated example</div>
                    <div class="whitespace-pre-wrap">{{cardList[currentCardIndex].exampleAI}}</div>
                </div>
            </div>
        </div>
      </UCard>
    </USlideover>
</template>
