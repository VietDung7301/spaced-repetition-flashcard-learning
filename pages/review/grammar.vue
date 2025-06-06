<script setup lang="ts">
import { _backgroundColor } from '#tailwind-config/theme';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { randomEnum, type GrammarCardQuestion, type GrammarQuestionOption, type GrammarCard, GrammarQuestionType, type CardSet, SetType } from '~/types/type';

const toast = useToast()
const genAI = new GoogleGenerativeAI(useRuntimeConfig().public.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
const { user_id, speakerId, voiceUrl } = storeToRefs(useAuthStore());

const cardList = ref()
const currentOptionList = ref<GrammarQuestionOption[]>()
const isShowFullWord = ref(false)


// Add functionality to generate audio from selected text
const selectedText = ref('')
const showAudioButton = ref(false)
const audioButtonPosition = ref({ x: 0, y: 0 })

const copiedAudioElement = ref<HTMLAudioElement>()

const currentCard = ref<GrammarCard>()

let currentCardIndex = ref(0)
let questionType = ref<GrammarQuestionType>(randomEnum(GrammarQuestionType))
let userInput = ref('')
let inputColor = ref('primary')
let isEdit = ref(false)

const getWordExampleByAI = async (grammar: string) => {
    return model.generateContent(`
        Bạn là một chuyên gia về tiếng Nhật với nhiều năm kinh nghiệm trong việc giảng dạy và giải thích các quy tắc ngữ pháp cho người học. Bạn có khả năng cung cấp những ví dụ rõ ràng và dễ hiểu để người học có thể áp dụng vào giao tiếp hàng ngày.
        Nhiệm vụ của bạn là tìm 3 ví dụ về cách sử dụng ngữ pháp ${grammar} trong câu tiếng Nhật.

        Hãy lưu ý rằng các ví dụ cần phải bao gồm cả câu tiếng Nhật và bản dịch tiếng Việt để người học dễ dàng hiểu và áp dụng.
        Hãy chỉ đưa ra ví dụ kèm bản dịch tiếng Việt và đừng giải nói gì thêm.
        Ví dụ:

        1: __________
        2: __________
        3: __________
    `)
}

const getQuestion = async (card: GrammarCardQuestion) => {
    card.options = await $fetch<GrammarQuestionOption[]>(`/api/card/grammar/question_option?grammar=${card.grammar}&meaning=${card.meaning}&id=${card.id}&user_id=${user_id.value}`, {
        method: 'GET'
    })
    
    for (let option of card.options) {
        option.bg_color = {"bg-white dark:bg-slate-900": true}
    }
    return card.options
}

const setList = await $fetch<CardSet[]>(`/api/card_set?user_id=${user_id.value}`, {
    method: "GET",
})

$fetch<GrammarCardQuestion[]>(`/api/card/grammar/due?user_id=${user_id.value}`, {
    method: "GET",
}).then((value: GrammarCardQuestion[]) => {
    cardList.value = value

    if (cardList.value.length > 0) {
        getWordExampleByAI(
            cardList.value[currentCardIndex.value].grammar
        ).then((value: any) => {
            cardList.value[currentCardIndex.value].exampleAI = value.response.text().replaceAll("\n\n", "\n")
        })

        let card = cardList.value[currentCardIndex.value]
        getQuestion(card).then((options) => {
            currentOptionList.value = options
        })

        currentCard.value = card

        if (currentCardIndex.value + 1< cardList.value.length) {
            card = cardList.value[currentCardIndex.value + 1]
            getQuestion(card)
        }
    }
})
.catch((err: any) => {
    toast.add({title: "Error", description: err.message, color: 'red'})
    console.error(err)
})


const generateAudio = async (text: string) => {
    try {
        // Step 1: Query the audio query endpoint
        const queryResponse = await fetch(`${voiceUrl.value}/audio_query?text=${encodeURIComponent(text)}&speaker=${speakerId.value}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        })
        
        if (!queryResponse.ok) {
            throw new Error(`Failed to get audio query: ${queryResponse.status}`)
        }
        
        const queryData = await queryResponse.json()
        
        // Step 2: Synthesize the audio
        const synthesisResponse = await fetch(`${voiceUrl.value}/synthesis?speaker=${speakerId.value}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(queryData)
        })
        
        if (!synthesisResponse.ok) {
            throw new Error(`Failed to synthesize audio: ${synthesisResponse.status}`)
        }
        
        // Convert the audio blob to a URL and play it automatically
        const audioBlob = await synthesisResponse.blob()
        return URL.createObjectURL(audioBlob)
    } catch (err:any) {
        toast.add({title: "Error", description: err.message, color: 'red'})
        console.error('TTS Error:', err)
    }
}


const generateSelectedTextAudio = () => {
    console.log("selectedText", selectedText.value)
    if (selectedText.value) {
        console.log("Generating audio for selected text:", selectedText.value)
        generateAudio(selectedText.value).then((url: string | undefined) => {
            if (url) {
                copiedAudioElement.value?.pause()
                copiedAudioElement.value?.remove()
                copiedAudioElement.value = new Audio(url)
                copiedAudioElement.value.play()
            }
        })
    }
    showAudioButton.value = false
}

// Handle text selection
const handleTextSelection = () => {
    const selection = window.getSelection()
    console.log("selection", selection)
    if (selection && selection.toString().trim()) {
        selectedText.value = selection.toString().trim()
        console.log("selectedText", selectedText.value)
        showAudioButton.value = true
        
        // Calculate position for the audio button near the selection
        const range = selection.getRangeAt(0)
        const rect = range.getBoundingClientRect()
        audioButtonPosition.value = {
            x: rect.right + window.scrollX,
            y: rect.top + window.scrollY
        }
    } else {
        showAudioButton.value = false
    }
}

const handleChoseAnswer = (option: GrammarQuestionOption) => {
    $fetch(`/api/card/${cardList.value[currentCardIndex.value].id}/learning_process`, {
        method: 'PUT',
        body: {
            isCorrect: option.isCorrect,
            interval: cardList.value[currentCardIndex.value].interval,
            ease_factor: cardList.value[currentCardIndex.value].ease_factor,
            repetitions: cardList.value[currentCardIndex.value].repetitions,
            type: SetType.grammar
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

    currentCard.value = cardList.value[currentCardIndex.value]

    if (currentCardIndex.value + 1 < cardList.value.length) {
        getQuestion(cardList.value[currentCardIndex.value + 1])
    }
}

const state = reactive({
	currentEditingCard: {} as GrammarCard
})

const handleClickEdit = (card:GrammarCard) => {
    isEdit.value = true;
    state.currentEditingCard = {...card}
}

const handleUpdateWord = async () => {
    if (typeof state.currentEditingCard.set_id === 'string') {
        state.currentEditingCard.set_id = Number(state.currentEditingCard.set_id)
    }
	$fetch(`/api/card/${state.currentEditingCard.id}`, {
		method: "PUT",
		body: {
            ...state.currentEditingCard,
            type: SetType.grammar
		}
	}).finally( () => {
		toast.add({title: "Update word success"})
        currentCard.value = state.currentEditingCard
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

// Add event listener for text selection
onMounted(() => {
    document.addEventListener('mouseup', handleTextSelection)
    // document.addEventListener('keyup', handleTextSelection)
})

// Remove event listener on component unmount
onUnmounted(() => {
    document.removeEventListener('mouseup', handleTextSelection)
    // document.removeEventListener('keyup', handleTextSelection)
})
</script>

<template>
<!-- Floating audio button that appears when text is selected -->
<div v-if="showAudioButton" 
    class="fixed z-50 p-2 bg-white dark:bg-slate-800 rounded-full shadow-lg cursor-pointer animate-fade-in flex items-center justify-center"
    :style="`left: ${audioButtonPosition.x}px; top: ${audioButtonPosition.y - 30}px;`"
    v-on:mousedown="generateSelectedTextAudio()">
    <UIcon name="i-heroicons-speaker-wave" class="text-primary-500 w-5 h-5" />
</div>
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
                <div v-if="questionType !== GrammarQuestionType.WordToMeaning" 
                    class="text-xl whitespace-pre-wrap"
                    v-html="currentCard?.meaning">
                </div>
                <div v-else class="text-xl whitespace-pre-wrap"
                    v-html="currentCard?.grammar">
                </div>
            </template>

            <div v-if="questionType === GrammarQuestionType.MeaningToWord" class="flex flex-col">
                <div class="grid grid-cols-2 gap-4">
                    <UButton v-for="(option, idx) in currentOptionList" 
                        class="h-36 flex items-center justify-center text-xl text-black dark:text-white shadow-md border-slate-300 border dark:border-slate-700"
                        :key="idx"
                        :class="option.bg_color"
                        @click="handleChoseAnswer(option)"
                        v-html="option.grammar">
                    </UButton>
                </div>
            </div>
            <div v-else-if="questionType === GrammarQuestionType.WordToMeaning" class="flex flex-col">
                <div class="grid grid-cols-2 gap-4">
                    <UButton v-for="(option, idx) in currentOptionList" 
                        class="h-36 flex items-center justify-center text-xl text-black dark:text-white shadow-md border-slate-300 border dark:border-slate-700"
                        :key="idx"
                        :class="option.bg_color"
                        @click="handleChoseAnswer(option)"
                        v-html="option.meaning">
                    </UButton>
                </div>
            </div>
        </UCard>
    </div>
    <div v-show="isShowFullWord" class="bottom-0 fixed w-screen">
        <UCard>
            <template #header>
            <div class="flex items-center justify-between">
                <div class="text-3xl text-green-800 dark:text-green-400 mb-2" v-html="currentCard?.grammar"></div>
                <div class="gap-4 flex">
                    <UButton color="gray" icon="i-heroicons-pencil-square" @click="currentCard && handleClickEdit(currentCard)">
                    </UButton>
                    <UButton icon="i-material-symbols:keyboard-double-arrow-right-rounded" @click="handleNextCard">
                        Next
                    </UButton>
                </div>
            </div>
            </template>

            <div class="overflow-y-auto h-64">
                <div class="flex flex-col gap-y-4">
                    <div class="text-xl whitespace-pre-wrap" v-html="currentCard?.meaning"></div>
                    <div class="flex justify-start">
                        <div v-if="currentCard?.structure"
                            class="text-xl whitespace-pre-wrap border-2 px-4 py-3 border-indigo-500 rounded-3xl sm:ml-16 sm:px-16"
                            v-html="currentCard?.structure">
                        </div>
                    </div> 
                </div>
                <UDivider class="h-4"/>
                <div class="">
                    <div v-if="currentCard?.example">
                        <div class="text-green-800 dark:text-green-400"><UIcon class="text-inherit" name="i-mdi:arrow-expand-right"/> Example</div>
                        <div class="whitespace-pre-wrap" v-html="currentCard?.example"></div>
                    </div>
                    <div v-if="currentCard?.exampleAI">
                        <div class="text-green-800 dark:text-green-400"><UIcon class="text-inherit" name="i-mdi:arrow-expand-right"/> AI generated example</div>
                        <div class="whitespace-pre-wrap">{{currentCard?.exampleAI}}</div>
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
        <h3 class="text-xl font-semibold leading-6 text-gray-900 dark:text-white">
            Edit
        </h3>
        <UButton color="gray" variant="ghost" icon="i-heroicons-x-mark-20-solid" class="-my-1" @click="isEdit = false" />
        </div>
    </template>
    <div>
        <label class="text-md font-semibold text-green-800 dark:text-green-600">Select set</label>
        <USelect 
            color="gray"
            v-model="state.currentEditingCard.set_id" 
            :options="setList"
            option-attribute="name"
            value-attribute="id"
            class="mb-3">
        </USelect>

        <label class="text-md font-semibold text-green-800 dark:text-green-600">Grammar</label>
        <UInput v-model="state.currentEditingCard.grammar" class="mb-3" :autofocus="true" autocomplete="off" spellcheck="false"/>

        <label class="text-md font-semibold text-green-800 dark:text-green-600">Structure</label>
        <div class="mb-3">
            <TiptapEditor v-model="state.currentEditingCard.structure"/>
        </div>

        <label class="text-md font-semibold text-green-800 dark:text-green-600">Meaning</label>
        <div class="mb-3">
            <TiptapEditor v-model="state.currentEditingCard.meaning"/>
        </div>

        <label class="text-md font-semibold text-green-800 dark:text-green-600">Example</label>
        <div class="mb-7">
            <TiptapEditor v-model="state.currentEditingCard.example"/>
        </div>
        <UButton icon="mingcute:check-circle-fill" type="submit" @click="handleUpdateWord">Submit</UButton>
    </div>
    </UCard>
</UModal>
</template>
