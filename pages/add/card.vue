<script setup lang="ts">
import { type CardSet, SetType } from '~/types/type';
const { user_id } = storeToRefs(useAuthStore());
const toast = useToast()

const cardType = ref(SetType.vocabulary)
const setId = ref(0)
const isAddMultiple = ref(false)

let columns = ref(["Word", "Pronunciation", "Meaning", "Example"])
const selectedRows = ref<boolean[]>([])
const invalidRows = ref<boolean[]>([])
const selectAll = ref(false)

let insertedCards = ref<String[][]>([])

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
	if (cardType.value === SetType.vocabulary) {
		columns.value = ["Word", "Pronunciation", "Meaning", "Example"]
	} else if (cardType.value === SetType.grammar) {
		columns.value = ["Grammar", "Structure", "Meaning", "Example"]
	} else {
		columns.value = ["Word", "Pronunciation", "Meaning", "How to remember", "Example"]
	}
}

const toggleSelectAll = () => {
	if (selectAll.value) {
		selectedRows.value = insertedCards.value.map(() => true)
	} else {
		selectedRows.value = insertedCards.value.map(() => false)
	}
}

const deleteSelectedRows = () => {
	insertedCards.value = insertedCards.value.filter((_, index) => !selectedRows.value[index])
	invalidRows.value = invalidRows.value.filter((_, index) => !selectedRows.value[index])
	selectedRows.value = insertedCards.value.map(() => false)
	selectAll.value = false
}

const onPaste = (event:any) => {
	const input = event.clipboardData.getData('text/plain') as string
	const htmlData = event.clipboardData.getData('text/html')
	console.log("input", input)
	console.log("htmlData", htmlData)

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

const onPasteMultiple = (event:any) => {
	const htmlData = event.clipboardData.getData('text/html')
	console.log("htmlData", htmlData)

	if (htmlData) {
			event.preventDefault()
			// Process HTML data from Excel
			const tempDiv = document.createElement('div')
			tempDiv.innerHTML = htmlData
			
			// Extract data from HTML table
			const rows = tempDiv.querySelectorAll('tr')
			for (let row of rows) {
				const cells = row.querySelectorAll('td, th')
				const values = Array.from(cells).map(cell => {
					// Preserve formatting like strikethrough
					return cell.innerHTML.replace(/\n/g, '')
				})
				if (values.length > 0) {
					if (!values[2] || !values[0]) {
						invalidRows.value.push(true)
					} else {
						invalidRows.value.push(false)
					}
					insertedCards.value.push(values)
				}
			}
		}
	if (invalidRows.value.filter(Boolean).length > 0) {
		toast.add({
			title: "Some rows are invalid",
			description: "Check xem có thiếu gì ko?",
			color: 'red'
		})
	}
}

const submitMultiple = () => {
	if (insertedCards.value.length === 0) {
		toast.add({
			title: "Thế không có gì để thêm à?",
			color: 'red'
		})
		return
	}
	if (setId.value === 0) {
		toast.add({
			title: "Thế không chọn set thì thêm vào đâu?",
			color: 'red'
		})
		return
	}
	if (invalidRows.value.filter(Boolean).length > 0) {
		toast.add({
			title: "Nó đỏ chót thế kia mà không thấy à?",
			color: 'red'
		})
		return
	}
	$fetch("/api/card/insert_multiple", {
		method: "POST",
		body: {
			type: cardType.value,
			set_id: setId.value,
			cards: insertedCards.value
		}
	})
	.then((data: any) => {
		console.log("data", data.result)
		toast.add({
			title: "Success",
			description: "Added " + data.result.length + " words, " + (insertedCards.value.length - data.result.length) + " duplications",
			color: 'green'
		})
	})
	.catch((error) => {
		console.log("error", error)	
		toast.add({
			title: error.statusMessage,
			color: 'red'
		})
	})
}


const onSubmit = () => {
	if (setId.value === 0) {
		toast.add({
			title: "Chưa chọn set thì thêm vào đâu?",
			color: 'red'
		})
		return
	}
	if ((cardType.value === SetType.vocabulary && (!vocabularyState.word || !vocabularyState.meaning))
		||cardType.value === SetType.grammar && (!grammarState.grammar || !grammarState.meaning)
		||cardType.value === SetType.kanji && (!kanjiState.word || !kanjiState.meaning)) {
		toast.add({
			title: "Thiếu trường gòi :)",
			color: 'red'
		})
		return
	}

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
			<div class="p-6 bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-900 dark:border-gray-700">
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
							<label for="kanji" class="text-md font-semibold text-green-800 dark:text-green-600">Word</label>
							<input type="text" id="kanji" v-model="vocabularyState.word"
								@paste="onPaste"
								class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg 
															focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-800 dark:border-gray-600 
															dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" 
								placeholder="漢字"
								spellcheck="false"
								autocomplete="off"
								required />
						</div>
						<div class="w-1/2">
							<label for="read" class="text-md font-semibold text-green-800 dark:text-green-600">Pronunciation</label>
							<input type="text" id="read" v-model="vocabularyState.pronunciation"
								class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg 
															focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-800 dark:border-gray-600 
															dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" 
								placeholder="かんじ" 
								spellcheck="false"
								autocomplete="off"/>
						</div>
					</div>
					<div class="flex flex-row mb-5">
						<div class="w-full">
							<label for="meaning" class="text-md font-semibold text-green-800 dark:text-green-600">Meaning</label>
							<textarea type="text" id="meaning" v-model="vocabularyState.meaning"
								class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg 
															focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-800 dark:border-gray-600 
															dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" 
								spellcheck="false"/>
						</div>
					</div>
					<div class="flex flex-row">
						<div class="w-full">
							<label for="example" class="text-md font-semibold text-green-800 dark:text-green-600">Example</label>
							<div>
								<textarea name="example" id="example" rows="2" v-model="vocabularyState.example"
								class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg 
															focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-800 dark:border-gray-600 
															dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
								spellcheck="false" />
							</div>
						</div>
					</div>
				</div>
				<div v-else-if="cardType === SetType.grammar">
					<div class="flex flex-row mb-5 gap-4">
						<div class="w-full">
							<label for="grammar" class="text-md font-semibold text-green-800 dark:text-green-600">Grammar</label>
							<input type="text" id="grammar" v-model="grammarState.grammar"
								@paste="onPaste"
								class="bg-gray-100 text-gray-900 text-sm rounded-lg 
															focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-800
															dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" 
								placeholder="～ことにする"
								spellcheck="false"
								autocomplete="off"
								required />
						</div>
					</div>
					<div class="flex flex-row mb-5">
						<div class="w-full">
							<label for="structure" class="text-md font-semibold text-green-800 dark:text-green-600">Structure</label>
							<div class="text-sm">
								<TiptapEditor v-model="grammarState.structure"/>
							</div>
						</div>
					</div>
					<div class="flex flex-row mb-5">
						<div class="w-full">
							<label for="meaning" class="text-md font-semibold text-green-800 dark:text-green-600">Meaning</label>
							<div class="text-sm">
								<TiptapEditor v-model="grammarState.meaning"/>
							</div>
						</div>
					</div>
					<div class="flex flex-row">
						<div class="w-full">
							<label for="example" class="text-md font-semibold text-green-800 dark:text-green-600">Example</label>
							<div class="text-sm">
								<TiptapEditor v-model="grammarState.example"/>
							</div>
						</div>
					</div>
				</div>
				<div v-else>
					<div class="flex flex-row mb-5 gap-4">
						<div class="w-full">
							<label for="kanji" class="text-md font-semibold text-green-800 dark:text-green-600">Kanji</label>
							<input type="text" id="kanji" v-model="kanjiState.word"
								@paste="onPaste"
								class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg 
															focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-800 dark:border-gray-600 
															dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" 
								placeholder="漢字"
								spellcheck="false"
								autocomplete="off"
								required />
						</div>
					</div>
					<div class="flex flex-row mb-5 gap-4">
						<div class="w-full">
							<label for="read" class="text-md font-semibold text-green-800 dark:text-green-600">Pronunciation</label>
							<textarea type="text" id="read" v-model="kanjiState.pronunciation"
								class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg 
															focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-800 dark:border-gray-600 
															dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" 
								placeholder="かんじ" 
								spellcheck="false"
								autocomplete="off"/>
						</div>
					</div>
					<div class="flex flex-row mb-5">
						<div class="w-full">
							<label for="meaning" class="text-md font-semibold text-green-800 dark:text-green-600">Meaning</label>
							<textarea type="text" id="meaning" v-model="kanjiState.meaning"
								class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg 
															focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-800 dark:border-gray-600 
															dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" 
								spellcheck="false"
								required/>
						</div>
					</div>
					<div class="flex flex-row mb-5">
						<div class="w-full">
							<label for="remember" class="text-md font-semibold text-green-800 dark:text-green-600">How to remember</label>
							<textarea type="text" id="remember" v-model="kanjiState.how_to_remember"
								class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg 
															focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-800 dark:border-gray-600 
															dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" 
								spellcheck="false"/>
						</div>
					</div>
					<div class="flex flex-row">
						<div class="w-full">
							<label for="example" class="text-md font-semibold text-green-800 dark:text-green-600">Example</label>
							<div>
								<textarea name="example" id="example" rows="2" v-model="kanjiState.example"
								class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg 
															focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-800 dark:border-gray-600 
															dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
								spellcheck="false" />
							</div>
						</div>
					</div>
				</div>


				<div class="flex flex-row-reverse gap-4">
					<button type="button" @click="onSubmit"
							class="mt-5 text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center  dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
						<svg class="w-6 h-6 mr-2 text-white dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"
							width="24" height="24" fill="none" viewBox="0 0 24 24">
							<path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="3"
							d="M5 11.917 9.724 16.5 19 7.5" />
						</svg>
						Save
					</button>
					<UButton class="mt-5 font-medium rounded-lg text-sm px-5 py-2.5 text-center" color="gray" @click="isAddMultiple = true">
						Add multiple cards
					</UButton>
				</div>
			</div>
		</form>
	</div>
	<div v-show="isAddMultiple" class="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center">
		<UCard class="w-4/5">
			<div class="grid grid-cols-2 gap-8 mb-5">
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
				<UFormGroup label="Paste here">
					<UInput
						icon="i-fluent:clipboard-paste-16-regular"
						padding="md"
						color="gray"
						:options="setTypes"
						option-attribute="name"
						@paste="onPasteMultiple">
					</UInput>
				</UFormGroup>
				<div class="flex flex-row justify-end gap-8 items-center max-sm:flex-col max-sm:gap-0">
					<span class="text-sm text-gray-500">
						{{ selectedRows.filter(Boolean).length }} items selected
					</span>
					<UButton 
						v-if="selectedRows.filter(Boolean).length > 0"
						color="red" 
						size="sm" 
						icon="i-heroicons-trash"
						@click="deleteSelectedRows"
					>
						Delete Selected
					</UButton>
				</div>
			</div>
			<div class="overflow-x-hidden overflow-y-auto min-h-32 max-h-96">

				<table class="w-full table-auto border-collapse">
					<thead class="sticky top-0 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-600">
						<tr>
							<th class="border-b border-gray-200 p-4 pt-0 pb-3 pl-4 text-left dark:border-gray-600">
								<UCheckbox v-model="selectAll" @change="toggleSelectAll" />
							</th>
							<th v-for="column in columns" :key="column" class="border-b border-gray-200 p-4 pt-0 pb-3 pl-8 text-left font-medium text-gray-400 dark:border-gray-600 dark:text-gray-200">
								{{ column }}
							</th>
						</tr>
					</thead>
					<tbody class="bg-white dark:bg-gray-800">
						<tr v-for="(card, index) in insertedCards" 
							:key="index" 
							:class="[{ 'bg-gray-50 dark:bg-gray-800': selectedRows[index] }, { 'bg-red-200 dark:bg-rose-600': invalidRows[index] }]"
							@click="selectedRows[index] = !selectedRows[index]"
							class="cursor-pointer">
							<td class="border-b border-gray-100 p-4 pl-4 dark:border-gray-700" @click.stop>
								<UCheckbox v-model="selectedRows[index]" />
							</td>
							<td v-for="cell in card" class="border-b border-gray-100 p-4 pl-8 dark:border-gray-700 whitespace-pre-wrap" v-html="cell">
							</td>
						</tr>
					</tbody>
				</table>
			</div>
			<template #footer>
				<div class="flex justify-end gap-4">
					<UButton 
						color="gray" @click="isAddMultiple = false" 
						icon="i-material-symbols:close-rounded"
						class="font-medium rounded-lg text-sm px-5 py-2.5 text-center"
					>
						Close
					</UButton>
					<UButton 
						color="blue" @click="submitMultiple" 
						icon="i-material-symbols:fitbit-check-small-rounded"
						class="font-medium rounded-lg text-sm px-5 py-2.5 text-center"
					>
						Save
					</UButton>
				</div>
			</template>
		</UCard>
	</div>
</template>

