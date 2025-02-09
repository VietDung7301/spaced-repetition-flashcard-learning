<script setup lang="ts">
import { object, string, nonempty, integer, type Infer } from 'superstruct'
import type { FormSubmitEvent } from '#ui/types'
import { SetType } from "~/types/type"
const toast = useToast()
const { user_id } = storeToRefs(useAuthStore());

const schema = object({
	name: nonempty(string()),
	type: integer()
})

const state = reactive({
	name: '',
	type: SetType.vocabulary
})

const setType = [
	{name: "Vocabulary", value: SetType.vocabulary},
	{name: "Grammar", value: SetType.grammar},
	{name: "Kanji", value: SetType.kanji}
]

type Schema = Infer<typeof schema>

const onSubmit = (event: FormSubmitEvent<Schema>) => {
	$fetch("/api/card_set", {
		method: "POST",
		body: {
			name: event.data.name,
			user_id: user_id.value,
			type: event.data.type
		}
	})
	.then(() => {
		toast.add({title: "Add new list success"})
		state.name = ""
	})
	.catch((error) => {
		toast.add({
			title: error.statusMessage,
			color: 'red'
		})
	})
}

const onChangeType = (event: any) => {
	if (typeof state.type === "string") {
		state.type = Number(state.type)
	}
}
</script>

<template>
<div class="flex justify-center items-center">
	<UCard class="justify-center items-center w-1/3 max-sm:w-11/12 mt-20">
		<UForm :schema="schema" :state="state" class="space-y-4 w-full" @submit="onSubmit">
			<UFormGroup label="Select type" class ="w-full">
				<USelect 
					v-model="state.type" 
					:options="setType" 
					option-attribute="name" 
					:autofocus="true"
					v-on:change="onChangeType">
				</USelect>
			</UFormGroup>
			<UFormGroup label="Name of this set" name="name" class="w-full">
				<UInput v-model="state.name" autocomplete="off" spellcheck="false"/>
			</UFormGroup>

			<UButton type="submit">
				Submit
			</UButton>
		</UForm>
	</UCard>
</div>

</template>
