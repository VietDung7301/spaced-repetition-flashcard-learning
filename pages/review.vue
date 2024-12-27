<script setup lang="ts">
import { _backgroundColor } from '#tailwind-config/theme';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { empty } from 'superstruct';
import { randomEnum, type CardQuestion, type QuestionOption, type Card, QuestionType } from '~/types/type';

const toast = useToast()
const genAI = new GoogleGenerativeAI(useRuntimeConfig().public.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
const colorMode = useColorMode()
const { user_id } = storeToRefs(useAuthStore());

const cardList = ref()
const currentOptionList = ref<QuestionOption[]>()
const isShowFullWord = ref(false)

const getWordExampleByAI = async (word: string) => {
    return model.generateContent(`
        Hãy cho tìm cho tôi 2 câu có sử dụng câu có từ ${word} trong sách, báo, tạp chí hoặc website tiếng Nhật.
        Hãy chỉ gửi cho tôi ví dụ của bạn và không nhắn thêm bất cứ điều gì.
        Câu trả lời được viết dưới dạng: 
            1. Câu tiếng Nhật  Cách đọc  Ý nghĩa tiếng Việt.
            2. Câu tiếng Nhật  Cách đọc  Ý nghĩa tiếng Việt.
        Trong đó, cách dọc được viết dưới dạng chữ hiragana. 
        Ví dụ, chữ "勉強" khi được viết dưới dạng hiragana sẽ là "べんきょう" mà không phải là "benkyou".`
    )
}

cardList.value = await $fetch<CardQuestion[]>(`/api/card/due?user_id=${user_id.value}`, {
    method: "GET",
})
let currentCardIndex = ref(0)
let questionType = ref<QuestionType>(randomEnum(QuestionType))
let userInput = ref('')
let inputColor = ref('primary')
let isEdit = ref(false)

if (!empty(cardList.value)) {
    getWordExampleByAI(
        cardList.value[currentCardIndex.value].word
    ).then((value: any) => {
        cardList.value[currentCardIndex.value].exampleAI = value.response.text().replaceAll("\n\n", "\n")
    })
}


for (let card of cardList.value) {
    $fetch<QuestionOption>(`/api/card/question_option?word=${card.word}&meaning=${card.meaning}`, {
        method: 'GET'
    }).then((value: QuestionOption) => {
        if (value !== null) {
            card.options = value
            currentOptionList.value = cardList.value[0].options
        }
        for (let option of card.options) {
            if (colorMode.value === "dark")
                option.bg_color = "rgb(15 23 42 / var(--tw-bg-opacity, 1))"
            else option.bg_color = "white"
        }
    })
}

const handleSubmitAnswer = (isSubmit: boolean) => {
    $fetch(`/api/card/${cardList.value[currentCardIndex.value].id}/learning_process`, {
        method: 'PUT',
        body: {
            isCorrect: cardList.value[currentCardIndex.value].word === userInput.value && isSubmit === true,
            interval: cardList.value[currentCardIndex.value].interval,
            ease_factor: cardList.value[currentCardIndex.value].ease_factor,
            repetitions: cardList.value[currentCardIndex.value].repetitions
        }
    })
    if (cardList.value[currentCardIndex.value].word !== userInput.value || isSubmit !== true) {
        inputColor.value = "red"
    }
    setTimeout(() => {
        isShowFullWord.value = true
    }, 200)
}

const handleChoseAnswer = (option: QuestionOption) => {
    $fetch(`/api/card/${cardList.value[currentCardIndex.value].id}/learning_process`, {
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
    questionType.value = randomEnum(QuestionType)
    currentCardIndex.value++
    userInput.value = ""
    inputColor.value = "primary"
    if (currentCardIndex.value < cardList.value.length) {
        currentOptionList.value = cardList.value[currentCardIndex.value].options
        getWordExampleByAI(
            cardList.value[currentCardIndex.value].word
        ).then((value: any) => {
            cardList.value[currentCardIndex.value].exampleAI = value.response.text().replaceAll("\n\n", "\n")
        })
    }
}

const state = reactive({
	currentEditingCard: {} as Card
})

const handleClickEdit = (card:Card) => {
    isEdit.value = true;
    state.currentEditingCard = {...card}
}

const handleUpdateWord = async () => {
	$fetch(`/api/card/${state.currentEditingCard.id}`, {
		method: "PUT",
		body: {
            ...state.currentEditingCard
		}
	}).finally( () => {
		toast.add({title: "Update word success"})
        isEdit.value = false
    })
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
                <div v-if="questionType !== QuestionType.WordToMeaningChose" class="h-8 text-xl">
                    {{ cardList[currentCardIndex].meaning }}
                </div>
                <div v-else class="h-8 text-xl">
                    {{ cardList[currentCardIndex].word }}
                </div>
            </template>

            <div v-if="questionType === QuestionType.MeaningToWordChose" class="flex flex-col">
                <div class="grid grid-cols-2 gap-4">
                    <UButton v-for="(option, idx) in currentOptionList" 
                        class="h-36 flex items-center justify-center text-xl text-black dark:text-white shadow-md border-slate-300 border dark:border-slate-700"
                        :key="idx"
                        :style="{'background-color': option.bg_color}"
                        @click="handleChoseAnswer(option)">
                        {{ option.word }}
                    </UButton>
                </div>
            </div>
            <div v-else-if="questionType === QuestionType.WordToMeaningChose" class="flex flex-col">
                <div class="grid grid-cols-2 gap-4">
                    <UButton v-for="(option, idx) in currentOptionList" 
                        class="h-36 flex items-center justify-center text-xl text-black dark:text-white shadow-md border-slate-300 border dark:border-slate-700"
                        :key="idx"
                        :style="{'background-color': option.bg_color}"
                        @click="handleChoseAnswer(option)">
                        {{ option.meaning }}
                    </UButton>
                </div>
            </div>
            <div v-else>
                <div class="grid grid-cols-12 gap-4">
                    <UInput 
                        @keyup.enter="handleSubmitAnswer(true)"
                        v-model="userInput" 
                        class="col-span-8 h-full max-sm:col-span-12" 
                        size="xl" 
                        icon="i-material-symbols:edit-square-outline"
                        :color="inputColor"
                        :autofocus="true"/>
                    <div class="col-span-2 max-sm:col-span-12 h-full" >
                        <UButton
                            class="h-full"
                            label="Submit"
                            icon="i-material-symbols:keyboard-double-arrow-right-rounded"
                            block
                            @click="handleSubmitAnswer(true)"/>
                    </div>
                    <div class="col-span-2 max-sm:col-span-12 h-full" >
                        <UButton
                            class="h-full"
                            label="Don't know"                            
                            color="gray"
                            icon="i-mingcute:unhappy-dizzy-line"
                            block
                            @click="handleSubmitAnswer(false)"
                        />
                    </div>
                </div>
                
            </div>
        </UCard>
    </div>
    <USlideover v-model="isShowFullWord" side="bottom" :overlay="false" prevent-close :ui="{wrapper: 'fixed inset-0 flex z-40'}">
        <UCard>
            <template #header>
            <div class="flex items-center justify-between">
                <div class="text-3xl text-green-800 dark:text-green-400 mb-2">{{ cardList[currentCardIndex].word }}</div>
                <div class="gap-4 flex">
                    <UButton color="gray" icon="i-heroicons-pencil-square" @click="handleClickEdit(cardList[currentCardIndex])">
                    </UButton>
                    <UButton icon="i-material-symbols:keyboard-double-arrow-right-rounded" @click="handleNextCard">
                        Next
                    </UButton>
                </div>
            </div>
            </template>

            <div class="overflow-y-auto h-64">
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
            <template #footer>
                <div class="h-0"></div>
            </template>
        </UCard>
    </USlideover>
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
<UModal v-model="isEdit" :overlay="true">
    <UCard :ui="{ ring: '', divide: 'divide-y divide-gray-100 dark:divide-gray-800' }">
    <template #header>
        <div class="flex items-center justify-between">
        <h3 class="text-base font-semibold leading-6 text-gray-900 dark:text-white">
            Edit
        </h3>
        <UButton color="gray" variant="ghost" icon="i-heroicons-x-mark-20-solid" class="-my-1" @click="isEdit = false" />
        </div>
    </template>
    <div>
        <UFormGroup label="Word" name="word">
            <UInput v-model="state.currentEditingCard.word" class="mb-3" :autofocus="true"/>
        </UFormGroup>
        <UFormGroup label="Pronounciation" name="pronunciation">
            <UInput v-model="state.currentEditingCard.pronunciation" class="mb-3"/>
        </UFormGroup>
        <UFormGroup label="Meaning" name="meaning">
            <UTextarea v-model="state.currentEditingCard.meaning" class="mb-3"/>
        </UFormGroup>
        <UFormGroup label="Example" name="example">
            <UTextarea v-model="state.currentEditingCard.example" class="mb-3"/>
        </UFormGroup>
        <UButton icon="mingcute:check-circle-fill" type="submit" @click="handleUpdateWord">Submit</UButton>
    </div>
    </UCard>
</UModal>
</template>
