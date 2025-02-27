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
                <div class="text-lg font-bold">{{ 'word' in card ? card.word : ('grammar' in card ? card.grammar : '') }}</div>
                <div class="flex flex-wrap justify-between">
                    <div class="content-center">{{ card.meaning }}</div>
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
            <UFormGroup v-if="'word' in state.currentEditingCard" label="Word" name="word">
                <UInput v-model="state.currentEditingCard.word" class="mb-3" autocomplete="off" spellcheck="false"/>
            </UFormGroup>
            <UFormGroup v-if="'grammar' in state.currentEditingCard" label="Grammar" name="grammar">
                <UInput v-model="state.currentEditingCard.grammar" class="mb-3" autocomplete="off" spellcheck="false"/>
            </UFormGroup>
            <UFormGroup v-if="'pronunciation' in state.currentEditingCard" label="Pronunciation" name="pronunciation">
                <UInput v-model="state.currentEditingCard.pronunciation" class="mb-3" autocomplete="off" spellcheck="false"/>
            </UFormGroup>
            <UFormGroup v-if="'structure' in state.currentEditingCard" label="Structure" name="structure">
                <!-- <UTextarea v-model="state.currentEditingCard.structure" class="mb-3" autocomplete="off" spellcheck="false"/> -->
            </UFormGroup>
            <div v-if="'structure' in state.currentEditingCard"class="mb-3">
                <TiptapEditor v-model="state.currentEditingCard.structure" class="mb-3" />
            </div>
            <UFormGroup label="Meaning" name="meaning">
                <UTextarea v-model="state.currentEditingCard.meaning" class="mb-3" autocomplete="off" spellcheck="false"/>
            </UFormGroup>
            <UFormGroup v-if="'how_to_remember' in state.currentEditingCard" label="How to remember" name="how-to-remember" >
                <UTextarea v-model="state.currentEditingCard.how_to_remember" class="mb-3" autocomplete="off" spellcheck="false"></UTextarea>
            </UFormGroup>
            <UFormGroup label="Example" name="example">
                <UTextarea v-model="state.currentEditingCard.example" class="mb-3" autocomplete="off" spellcheck="false"/>
            </UFormGroup>
            <UButton icon="mingcute:check-circle-fill" type="submit" @click="handleUpdateWord">Submit</UButton>
        </div>
      </UCard>
    </UModal>
</template>