<script setup lang="ts">
import type { CardSet } from '~/types/type';
const { user_id } = storeToRefs(useAuthStore());
const toast = useToast()

const state = reactive({
	word: '',
	pronunciation: '',
	meaning: '',
	set_id: 0,
	example: ''
})

const setList = await $fetch<CardSet[]>(`/api/card_set?user_id=${user_id.value}`, {
    method: "GET",
})

const onPaste = (event:any) => {
	console.log(event.clipboardData.getData('text/plain'))
	let input = event.clipboardData.getData('text/plain') as string

	setTimeout(function() {
		// See if it matches our format
		let m = input.split('\t')
		console.log("m", m)
		if (m) {
			if (m.length > 0)
				state.word = m[0]
			if (m.length > 1)
				state.pronunciation = m[1]
			if (m.length > 2)
				state.meaning = m[2]
			if (m.length > 3)
				state.example = m[3]
		}
	}, 0);
}


const onSubmit = () => {
	$fetch("/api/card", {
		method: "POST",
		body: {
			word: state.word,
			pronunciation: state.pronunciation,
			meaning: state.meaning,
			example: state.example,
			set_id: state.set_id
		}
	})
	.then(() => {
		toast.add({title: "Add new word success"}),
		state.word = "",
		state.pronunciation = "",
		state.meaning = "",
		state.example = ""
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
				<div class="flex flex-row">
					<UFormGroup label="Select set" class="mb-5 mr-5 w-1/2">
						<USelect 
							color="gray"
							v-model="state.set_id" 
							:options="setList"
							option-attribute="name"
							value-attribute="id">
						</USelect>
					</UFormGroup>
				</div>
				<div class="flex flex-row mb-5 gap-4">
					<div class="w-1/2">
						<label for="kanji" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">漢字</label>
						<input type="text" id="kanji" v-model="state.word"
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
						<input type="text" id="read" v-model="state.pronunciation"
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
						<textarea type="text" id="meaning" v-model="state.meaning"
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
							<textarea name="example" id="example" rows="2" v-model="state.example"
							class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg 
                            focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 
                            dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
							spellcheck="false" />
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