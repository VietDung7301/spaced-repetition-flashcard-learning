<script setup lang="ts">
import type { CardSet, VocabCard } from '~/types/type';
const { user_id } = storeToRefs(useAuthStore());

const dueVocab = ref()
const dueGrammar = ref()
const dueKanji = ref()
const setList = ref<CardSet[]>()

$fetch<CardSet[]>(`/api/card_set?user_id=${user_id.value}`, {
    method: "GET",
}).then(value => {
    setList.value = value
})

$fetch(`/api/card/due?user_id=${user_id.value}`, {
    method: "GET",
}).then(value => {
    dueVocab.value = value.vocab
    dueGrammar.value = value.grammar
    dueKanji.value = value.kanji
})
</script>

<template>
    <div class="pt-10 px-20 max-sm:px-5">
        <div class="space-y-4">
            <p class="text-2xl font-bold">Learning Sets</p>
            <div class="grid grid-cols-4 max-sm:grid-cols-2 gap-4">
                <div v-for="set in setList" class="basis-1/4">
                    <UCard class="flex flex-col justify-center hover:cursor-pointer" @click="navigateTo(`/set/${set.id}`)">
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
                <div class="basis-1/4">
                    <UCard class="flex flex-col justify-center hover:cursor-pointer" @click="navigateTo(`/review/vocabulary`)">
                        <div class="flex flex-row gap-4">
                            <UIcon name="i-tabler:vocabulary" class="w-10 h-10 text-green-600" />
                            <span class="text-xl flex flex-row justify-between items-center w-full">
                                <div>Vocabulary</div> 
                                <div>{{ dueVocab }}</div>
                            </span>
                        </div>
                    </UCard>
                </div>
                <div class="basis-1/4">
                    <UCard class="flex flex-col justify-center hover:cursor-pointer" @click="navigateTo(`/review/grammar`)">
                        <div class="flex flex-row gap-4">
                            <UIcon name="i-tabler:text-grammar" class="w-10 h-10 text-green-600" />
                            <span class="text-xl flex flex-row justify-between items-center w-full">
                                <div>Grammar</div> 
                                <div>{{ dueGrammar }}</div>
                            </span>
                        </div>
                    </UCard>
                </div>
                <div class="basis-1/4">
                    <UCard class="flex flex-col justify-center hover:cursor-pointer" @click="navigateTo(`/review/kanji`)">
                        <div class="flex flex-row gap-4">
                            <UIcon name="i-uil:letter-chinese-a" class="w-10 h-10 text-green-600" />
                            <span class="text-xl flex flex-row justify-between items-center w-full">
                                <div>Kanji</div> 
                                <div>{{ dueKanji }}</div>
                            </span>
                        </div>
                    </UCard>
                </div>
            </div>
        </div>
    </div>
</template>
