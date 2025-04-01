<script setup lang="ts">
import type { CardSet, CardList, VocabCard, GrammarCard, KanjiCard } from '~/types/type';
import { SetType } from "~/types/type"
const toast = useToast()


const { user_id } = storeToRefs(useAuthStore());
const { id: setId } = useRoute().params

const cardList = ref<CardList>()

let setList = await $fetch<CardSet[]>(`/api/card_set?user_id=${user_id.value}`, {
    method: "GET",
})

$fetch<CardList>(`/api/card_set/${setId}`, {
    method: "GET",
}).then(value => {
    cardList.value = value
})

const isEdit = ref(false);

const state = reactive({
	currentEditingCard: {} as VocabCard | GrammarCard | KanjiCard
})

const handleClickEdit = (card:VocabCard | GrammarCard | KanjiCard) => {
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
            type: cardList.value?.type
		}
	}).finally( () => {
		toast.add({title: "Update word success"})
        isEdit.value = false
        $fetch<CardList>(`/api/card_set/${setId}`, {
            method: "GET",
        }).then((value: CardList) => {
            cardList.value = value
        })
    })
}

const handleDeleteWord = (cardId:number) => {
    $fetch(`/api/card/${cardId}?type=${cardList.value?.type}`, {
		method: "DELETE",
	}).finally( () => {
        $fetch<CardList>(`/api/card_set/${setId}`, {
            method: "GET",
        }).then((value: CardList) => {
            cardList.value = value
        })
		toast.add({title: "Delete word success"})
    })
}

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
        <div v-for="card in cardList?.cards" class="flex flex-row">
            <UCard class="min-w-48 w-1/2 mr-2 min-h-36">
                <div v-if="'word' in card" class="text-lg font-bold" v-html="card.word"></div>
                <div v-else-if="'grammar' in card" class="text-lg font-bold" v-html="card.grammar"></div>
                <div v-else-if="'kanji' in card" class="text-lg font-bold" v-html="card.kanji"></div>
                <div class="flex flex-wrap justify-between">
                    <div class="content-center" v-html="card.meaning"></div>
                </div>
            </UCard>
            <div class="w-24 mr-2 min-h-36 grid grid-col-2 justify-center">
                <UButton icon="mingcute:pencil-2-line" class="mb-2 ml-2 p-2" variant="soft" @click="handleClickEdit(card)">Edit</UButton>
                <UButton icon="mingcute:delete-2-line" color="red" variant="soft" class="ml-2 p-2" @click="handleDeleteWord(card.id)">Delete</UButton>
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
            <label v-if="'word' in state.currentEditingCard" class="text-md font-semibold text-green-800 dark:text-green-600">Word</label>
            <div v-if="'word' in state.currentEditingCard" class="mb-3">
                <TiptapEditor v-model="state.currentEditingCard.word" class="mb-3" />
            </div>
            <label v-if="'grammar' in state.currentEditingCard" class="text-md font-semibold text-green-800 dark:text-green-600">Grammar</label>
            <div v-if="'grammar' in state.currentEditingCard" class="mb-3">
                <TiptapEditor v-model="state.currentEditingCard.grammar" class="mb-3" />
            </div>
            <label v-if="'pronunciation' in state.currentEditingCard" class="text-md font-semibold text-green-800 dark:text-green-600">Pronunciation</label>
            <div v-if="'pronunciation' in state.currentEditingCard" class="mb-3">
                <TiptapEditor v-model="state.currentEditingCard.pronunciation" class="mb-3" />
            </div>
            <label v-if="'structure' in state.currentEditingCard" class="text-md font-semibold text-green-800 dark:text-green-600">Structure</label>
            <div v-if="'structure' in state.currentEditingCard"class="mb-3">
                <TiptapEditor v-model="state.currentEditingCard.structure" class="mb-3" />
            </div>
            <label v-if="'meaning' in state.currentEditingCard" class="text-md font-semibold text-green-800 dark:text-green-600">Meaning</label>
            <div class="mb-3">
                <TiptapEditor v-model="state.currentEditingCard.meaning" class="mb-3" />
            </div>
            <label v-if="'how_to_remember' in state.currentEditingCard" class="text-md font-semibold text-green-800 dark:text-green-600">How to remember</label>
            <div v-if="'how_to_remember' in state.currentEditingCard" class="mb-3">
                <TiptapEditor v-model="state.currentEditingCard.how_to_remember" class="mb-3" />
            </div>
            <label v-if="'example' in state.currentEditingCard" class="text-md font-semibold text-green-800 dark:text-green-600">Example</label>
            <div class="mb-3">
                <TiptapEditor v-model="state.currentEditingCard.example" class="mb-3" />
            </div>
            <UButton icon="mingcute:check-circle-fill" type="submit" @click="handleUpdateWord">Submit</UButton>
        </div>
      </UCard>
    </UModal>
</template>