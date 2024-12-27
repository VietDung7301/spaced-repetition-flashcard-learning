<script setup lang="ts">
import type { CardSet, Card } from '~/types/type';
const toast = useToast()


const { user_id } = storeToRefs(useAuthStore());
const { id: setId } = useRoute().params

const cardList = ref<Card[]>()

let setList = await $fetch<CardSet[]>(`/api/card_set?user_id=${user_id.value}`, {
    method: "GET",
})

$fetch<Card[]>(`/api/card_set/${setId}`, {
    method: "GET",
}).then(value => {
    cardList.value = value
})

const isEdit = ref(false);

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
        $fetch<Card[]>(`/api/card_set/${setId}`, {
            method: "GET",
        }).then((value:Card[]) => {
            cardList.value = value
        })
    })
}

const handleDeleteWord = (cardId:number) => {
    console.log(`${cardId} Welcome to Delete!`);
    $fetch(`/api/card/${cardId}`, {
		method: "DELETE",
	}).finally( () => {
        $fetch<Card[]>(`/api/card_set/${setId}`, {
            method: "GET",
        }).then((value:Card[]) => {
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
        <div v-for="card in cardList" class="flex flex-row">
            <UCard class="min-w-48 w-1/2 mr-2 min-h-36">
                <div class="text-lg font-bold">{{ card.word }}</div>
                <div class="flex flex-wrap justify-between">
                    <div class="pr-5">{{ card.pronunciation }}</div>
                    <div class="content-center">{{ card.meaning }}</div>
                </div>
                <div class="italic">{{ card.example }}</div>
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
            <UFormGroup label="Word" name="word">
                <UInput v-model="state.currentEditingCard.word" class="mb-3"/>
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