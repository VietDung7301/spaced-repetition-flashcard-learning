<script setup lang="ts">
import { _backgroundColor } from '#tailwind-config/theme';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { empty } from 'superstruct';
import { randomEnum, type GrammarCardQuestion, type GrammarQuestionOption, type VocabCard, GrammarQuestionType, type CardSet } from '~/types/type';

const toast = useToast()
const genAI = new GoogleGenerativeAI(useRuntimeConfig().public.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
const { user_id } = storeToRefs(useAuthStore());

const cardList = ref()
const currentOptionList = ref<GrammarQuestionOption[]>()
const isShowFullWord = ref(false)

const getWordExampleByAI = async (grammar: string) => {
    return model.generateContent(`
        Bạn là một chuyên gia về tiếng Nhật với nhiều năm kinh nghiệm trong việc giảng dạy và giải thích các quy tắc ngữ pháp cho người học. Bạn có khả năng cung cấp những ví dụ rõ ràng và dễ hiểu để người học có thể áp dụng vào giao tiếp hàng ngày.
        Nhiệm vụ của bạn là tìm 3 ví dụ về cách sử dụng ngữ pháp ${grammar} trong câu tiếng Nhật.

        Hãy lưu ý rằng các ví dụ cần phải bao gồm cả câu tiếng Nhật và bản dịch tiếng Việt để người học dễ dàng hiểu và áp dụng.

        Ví dụ:

        Câu ví dụ 1: __________
        Câu ví dụ 2: __________
        Câu ví dụ 3: __________
    `)
}

const setList = await $fetch<CardSet[]>(`/api/card_set?user_id=${user_id.value}`, {
    method: "GET",
})

cardList.value = await $fetch<GrammarCardQuestion[]>(`/api/card/grammar/due?user_id=${user_id.value}`, {
    method: "GET",
})
let currentCardIndex = ref(0)
let questionType = ref<GrammarQuestionType>(randomEnum(GrammarQuestionType))
let userInput = ref('')
let inputColor = ref('primary')
let isEdit = ref(false)

if (!empty(cardList.value)) {
    getWordExampleByAI(
        cardList.value[currentCardIndex.value].grammar
    ).then((value: any) => {
        cardList.value[currentCardIndex.value].exampleAI = value.response.text().replaceAll("\n\n", "\n")
    })
}


for (let card of cardList.value) {
    $fetch<GrammarQuestionOption>(`/api/card/grammar/question_option?grammar=${card.grammar}&meaning=${card.meaning}&id=${card.id}&user_id=${user_id.value}`, {
        method: 'GET'
    }).then((value: GrammarQuestionOption) => {
        if (value !== null) {
            card.options = value
            currentOptionList.value = cardList.value[0].options
        }
        for (let option of card.options) {
            option.bg_color = {"bg-white dark:bg-slate-900": true}
        }
    })
}

const handleChoseAnswer = (option: GrammarQuestionOption) => {
    $fetch(`/api/card/grammar/${cardList.value[currentCardIndex.value].id}/learning_process`, {
        method: 'PUT',
        body: {
            isCorrect: option.isCorrect,
            interval: cardList.value[currentCardIndex.value].interval,
            ease_factor: cardList.value[currentCardIndex.value].ease_factor,
            repetitions: cardList.value[currentCardIndex.value].repetitions
        }
    })
    if (option.isCorrect) {
        option.bg_color = {"!bg-primary-600": true}
    } else {
        option.bg_color = {"!bg-red-600": true}
    }
    setTimeout(() => {
        isShowFullWord.value = true
    }, 200)
}

const handleNextCard = () => {
    isShowFullWord.value = false
    questionType.value = randomEnum(GrammarQuestionType)
    currentCardIndex.value++
    userInput.value = ""
    inputColor.value = "primary"
    if (currentCardIndex.value < cardList.value.length) {
        currentOptionList.value = cardList.value[currentCardIndex.value].options
        getWordExampleByAI(
            cardList.value[currentCardIndex.value].grammar
        ).then((value: any) => {
            cardList.value[currentCardIndex.value].exampleAI = value.response.text().replaceAll("\n\n", "\n")
        })
    }
}

const state = reactive({
	currentEditingCard: {} as VocabCard
})

const handleClickEdit = (card:VocabCard) => {
    isEdit.value = true;
    state.currentEditingCard = {...card}
}

const handleUpdateWord = async () => {
    if (typeof state.currentEditingCard.set_id === 'string') {
        state.currentEditingCard.set_id = Number(state.currentEditingCard.set_id)
    }
	$fetch(`/api/card/grammar/${state.currentEditingCard.id}`, {
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
    handler: () => handleNextCard()
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
                <div v-if="questionType !== GrammarQuestionType.WordToMeaning" class="h-8 text-xl">
                    {{ cardList[currentCardIndex].meaning }}
                </div>
                <div v-else class="h-8 text-xl">
                    {{ cardList[currentCardIndex].grammar }}
                </div>
            </template>

            <div v-if="questionType === GrammarQuestionType.MeaningToWord" class="flex flex-col">
                <div class="grid grid-cols-2 gap-4">
                    <UButton v-for="(option, idx) in currentOptionList" 
                        class="h-36 flex items-center justify-center text-xl text-black dark:text-white shadow-md border-slate-300 border dark:border-slate-700"
                        :key="idx"
                        :class="option.bg_color"
                        @click="handleChoseAnswer(option)">
                        {{ option.grammar }}
                    </UButton>
                </div>
            </div>
            <div v-else-if="questionType === GrammarQuestionType.WordToMeaning" class="flex flex-col">
                <div class="grid grid-cols-2 gap-4">
                    <UButton v-for="(option, idx) in currentOptionList" 
                        class="h-36 flex items-center justify-center text-xl text-black dark:text-white shadow-md border-slate-300 border dark:border-slate-700"
                        :key="idx"
                        :class="option.bg_color"
                        @click="handleChoseAnswer(option)">
                        {{ option.meaning }}
                    </UButton>
                </div>
            </div>
        </UCard>
    </div>
    <div v-show="isShowFullWord" class="bottom-0 fixed w-screen">
        <UCard>
            <template #header>
            <div class="flex items-center justify-between">
                <div class="text-3xl text-green-800 dark:text-green-400 mb-2">{{ cardList[currentCardIndex].grammar }}</div>
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
                    <div class="text-xl">{{ cardList[currentCardIndex].structure }}</div>
                    <div class="text-xl">{{ cardList[currentCardIndex].meaning }}</div>
                </div>
                <UDivider class="h-4"/>
                <div class="">
                    <div v-if="cardList[currentCardIndex].example">
                        <div class="text-green-800 dark:text-green-400"><UIcon class="text-inherit" name="i-mdi:arrow-expand-right"/> Example</div>
                        <div class="whitespace-pre-wrap">{{cardList[currentCardIndex].example}}</div>
                    </div>
                    <div v-if="cardList[currentCardIndex].exampleAI">
                        <div class="text-green-800 dark:text-green-400"><UIcon class="text-inherit" name="i-mdi:arrow-expand-right"/> AI generated example</div>
                        <div class="whitespace-pre-wrap">{{cardList[currentCardIndex].exampleAI}}</div>
                    </div>
                </div>
            </div>
            <template #footer>
                <div class="h-0"></div>
            </template>
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
        <UFormGroup label="Select set" class="mb-5 mr-5 w-1/2">
            <USelect 
                color="gray"
                v-model="state.currentEditingCard.set_id" 
                :options="setList"
                option-attribute="name"
                value-attribute="id">
            </USelect>
        </UFormGroup>
        <UFormGroup label="Word" name="word">
            <UInput v-model="state.currentEditingCard.grammar" class="mb-3" :autofocus="true" autocomplete="off" spellcheck="false"/>
        </UFormGroup>
        <UFormGroup label="structure" name="structure">
            <UInput v-model="state.currentEditingCard.structure" class="mb-3" autocomplete="off" spellcheck="false"/>
        </UFormGroup>
        <UFormGroup label="Meaning" name="meaning">
            <UTextarea v-model="state.currentEditingCard.meaning" class="mb-3" autocomplete="off" spellcheck="false"/>
        </UFormGroup>
        <UFormGroup label="Example" name="example">
            <UTextarea v-model="state.currentEditingCard.example" class="mb-3" autocomplete="off" spellcheck="false"/>
        </UFormGroup>
        <UButton icon="mingcute:check-circle-fill" type="submit" @click="handleUpdateWord">Submit</UButton>
    </div>
    </UCard>
</UModal>
</template>
