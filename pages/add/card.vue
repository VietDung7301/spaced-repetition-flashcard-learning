<script setup lang="ts">
import { type CardSet, SetType } from '~/types/type';
const { user_id } = storeToRefs(useAuthStore());
const toast = useToast()

const cardType = ref(SetType.vocabulary)
const setId = ref(0)

const vocabularyState = reactive({
	word: '',
	pronunciation: '',
	meaning: '',
	example: ''
})

const grammarState = reactive({
	grammar: '',
	structure: '',
	meaning: '',
	example: ''
})

const kanjiState = reactive({
	word: '',
	pronunciation: '',
	meaning: '',
	how_to_remember: '',
	example: ''
})

const setTypes = [
	{name: "Vocabulary", value: SetType.vocabulary},
	{name: "Grammar", value: SetType.grammar},
	{name: "Kanji", value: SetType.kanji}
]


const setList = ref<CardSet[]>()
$fetch<CardSet[]>(`/api/card_set?user_id=${user_id.value}&type=${cardType.value}`, {
	method: "GET",
}).then(value => {
	setList.value = value
})

const onChangeType = () => {
	if (typeof cardType.value === "string") {
		cardType.value = Number(cardType.value)
	}
	$fetch<CardSet[]>(`/api/card_set?user_id=${user_id.value}&type=${cardType.value}`, {
		method: "GET",
	}).then(value => {
		setList.value = value
	})
}

const onPaste = (event:any) => {
	let input = event.clipboardData.getData('text/plain') as string
	const htmlData = event.clipboardData.getData('text/html')

	if (cardType.value === SetType.vocabulary) {
		setTimeout(function() {
			// See if it matches our format
			let m = input.split('\t')
			if (m) {
				if (m.length > 0)
					vocabularyState.word = m[0]
				if (m.length > 1)
					vocabularyState.pronunciation = m[1]
				if (m.length > 2)
					vocabularyState.meaning = m[2]
				if (m.length > 3)
					vocabularyState.example = m[3]
			}
		}, 0);
	} else if (cardType.value === SetType.grammar) {
		if (htmlData) {
			event.preventDefault()
			// Process HTML data from Excel
			const tempDiv = document.createElement('div')
			tempDiv.innerHTML = htmlData
			
			// Extract data from HTML table
			const rows = tempDiv.querySelectorAll('tr')
			if (rows.length > 0) {
				const cells = rows[0].querySelectorAll('td, th')
				const values = Array.from(cells).map(cell => {
					// Preserve formatting like strikethrough
					return cell.innerHTML
				})
				
				if (values.length > 0) grammarState.grammar = values[0]
				if (values.length > 1) grammarState.structure = values[1]
				if (values.length > 2) grammarState.meaning = values[2]
				if (values.length > 3) grammarState.example = values[3]
			}
		}
	}
}


const onSubmit = () => {
	let body = {}
	if (cardType.value === SetType.vocabulary) {
		body = {
			type: cardType.value,
			word: vocabularyState.word,
			pronunciation: vocabularyState.pronunciation,
			meaning: vocabularyState.meaning,
			example: vocabularyState.example,
			set_id: setId.value
		}
	} else if (cardType.value === SetType.grammar) {
		body = {
			type: cardType.value,
			grammar: grammarState.grammar,
			structure: grammarState.structure,
			meaning: grammarState.meaning,
			example: grammarState.example,
			set_id: setId.value
		}
	} else {
		body = {
			type: cardType.value,
			word: kanjiState.word,
			pronunciation: kanjiState.pronunciation,
			meaning: kanjiState.meaning,
			how_to_remember: kanjiState.how_to_remember,
			example: kanjiState.example,
			set_id: setId.value
		}
	}
	$fetch("/api/card", {
		method: "POST",
		body: body
	})
	.then(() => {
		toast.add({title: "Add new word success"}),
		vocabularyState.word = "",
		vocabularyState.pronunciation = "",
		vocabularyState.meaning = "",
		vocabularyState.example = ""

		grammarState.grammar = "",
		grammarState.structure = "",
		grammarState.meaning = "",
		grammarState.example = ""

		kanjiState.word = "",
		kanjiState.pronunciation = "",
		kanjiState.meaning = "",
		kanjiState.how_to_remember = "",
		kanjiState.example = ""
	})
	.catch((error) => {
		toast.add({
			title: error.statusMessage,
			color: 'red'
		})
	})
}
</script>

<template>
	<div class="flex flex-wrap  w-screen justify-center content-center mt-6">
		<form class="w-3/5 mx-auto max-sm:w-11/12">
			<div class="p-6 bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700">
				<div class="flex flex-row gap-4">
					<div class="w-1/2">
						<UFormGroup label="Select type">
							<USelect 
								color="gray"
								v-model="cardType" 
								:options="setTypes"
								option-attribute="name"
								v-on:change="onChangeType"
								required>
							</USelect>
						</UFormGroup>
					</div>
					<div class="w-1/2">
						<UFormGroup label="Select set">
							<USelect 
								color="gray"
								v-model="setId" 
								:options="setList"
								option-attribute="name"
								value-attribute="id"
								required>
							</USelect>
						</UFormGroup>
					</div>
				</div>
				<UDivider
					class="h-14"
				/>


				<div v-if="cardType === SetType.vocabulary">
					<div class="flex flex-row mb-5 gap-4">
						<div class="w-1/2">
							<label for="kanji" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">漢字</label>
							<input type="text" id="kanji" v-model="vocabularyState.word"
								@paste="onPaste"
								class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg 
															focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 
															dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" 
								placeholder="漢字"
								spellcheck="false"
								autocomplete="off"
								required />
						</div>
						<div class="w-1/2">
							<label for="read" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">読み方</label>
							<input type="text" id="read" v-model="vocabularyState.pronunciation"
								class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg 
															focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 
															dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" 
								placeholder="かんじ" 
								spellcheck="false"
								autocomplete="off"/>
						</div>
					</div>
					<div class="flex flex-row mb-5">
						<div class="w-full">
							<label for="meaning" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">意味</label>
							<textarea type="text" id="meaning" v-model="vocabularyState.meaning"
								class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg 
															focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 
															dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" 
								spellcheck="false"/>
						</div>
					</div>
					<div class="flex flex-row">
						<div class="w-full">
							<label for="example" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">例</label>
							<div class="mt-2">
								<textarea name="example" id="example" rows="2" v-model="vocabularyState.example"
								class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg 
															focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 
															dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
								spellcheck="false" />
							</div>
						</div>
					</div>
				</div>
				<div v-else-if="cardType === SetType.grammar">
					<div class="flex flex-row mb-5 gap-4">
						<div class="w-full">
							<label for="grammar" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">文法</label>
							<input type="text" id="grammar" v-model="grammarState.grammar"
								@paste="onPaste"
								class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg 
															focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 
															dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" 
								placeholder="～ことにする"
								spellcheck="false"
								autocomplete="off"
								required />
						</div>
					</div>
					<div class="flex flex-row mb-5">
						<div class="w-full">
							<label for="structure" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">構造</label>
							<!-- <textarea type="text" id="structure" v-model="grammarState.structure"
								class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg 
															focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 
															dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" 
								placeholder="Vる + ことにする" 
								spellcheck="false"
								autocomplete="off"/> -->
							<TiptapEditor v-model="grammarState.structure"/>
						</div>
					</div>
					<div class="flex flex-row mb-5">
						<div class="w-full">
							<label for="meaning" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">意味</label>
							<textarea type="text" id="meaning" v-model="grammarState.meaning"
								class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg 
															focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 
															dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" 
								spellcheck="false"
								required/>
						</div>
					</div>
					<div class="flex flex-row">
						<div class="w-full">
							<label for="example" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">例</label>
							<div class="mt-2">
								<textarea name="example" id="example" rows="2" v-model="grammarState.example"
								class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg 
															focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 
															dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
								spellcheck="false" />
							</div>
						</div>
					</div>
				</div>
				<div v-else>
					<div class="flex flex-row mb-5 gap-4">
						<div class="w-full">
							<label for="kanji" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">漢字</label>
							<input type="text" id="kanji" v-model="kanjiState.word"
								@paste="onPaste"
								class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg 
															focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 
															dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" 
								placeholder="漢字"
								spellcheck="false"
								autocomplete="off"
								required />
						</div>
					</div>
					<div class="flex flex-row mb-5 gap-4">
						<div class="w-full">
							<label for="read" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">読み方</label>
							<textarea type="text" id="read" v-model="kanjiState.pronunciation"
								class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg 
															focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 
															dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" 
								placeholder="かんじ" 
								spellcheck="false"
								autocomplete="off"/>
						</div>
					</div>
					<div class="flex flex-row mb-5">
						<div class="w-full">
							<label for="meaning" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">意味</label>
							<textarea type="text" id="meaning" v-model="kanjiState.meaning"
								class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg 
															focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 
															dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" 
								spellcheck="false"
								required/>
						</div>
					</div>
					<div class="flex flex-row mb-5">
						<div class="w-full">
							<label for="remember" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">覚える方</label>
							<textarea type="text" id="remember" v-model="kanjiState.how_to_remember"
								class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg 
															focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 
															dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" 
								spellcheck="false"/>
						</div>
					</div>
					<div class="flex flex-row">
						<div class="w-full">
							<label for="example" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">例</label>
							<div class="mt-2">
								<textarea name="example" id="example" rows="2" v-model="kanjiState.example"
								class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg 
															focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 
															dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
								spellcheck="false" />
							</div>
						</div>
					</div>
				</div>


				<div class="flex flex-row-reverse">
					<button type="button" @click="onSubmit"
						class="mt-5 text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center  dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
						<svg class="w-6 h-6 mr-2 text-white dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"
							width="24" height="24" fill="none" viewBox="0 0 24 24">
							<path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="3"
								d="M5 11.917 9.724 16.5 19 7.5" />
						</svg>
						Save
					</button>
				</div>
			</div>
		</form>
	</div>
</template>

