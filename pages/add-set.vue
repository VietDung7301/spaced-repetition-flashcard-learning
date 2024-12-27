<script setup lang="ts">
import { object, string, nonempty, type Infer } from 'superstruct'
import type { FormSubmitEvent } from '#ui/types'
const toast = useToast()
const { user_id } = storeToRefs(useAuthStore());

const schema = object({
	name: nonempty(string()),
})

const state = reactive({
	name: '',
})

type Schema = Infer<typeof schema>

const onSubmit = (event: FormSubmitEvent<Schema>) => {
	$fetch("/api/card_set", {
		method: "POST",
		body: {
			name: event.data.name,
			user_id: user_id.value
		}
	}).finally( () => 
		toast.add({title: "Add new list success"})
	)
}
</script>

<template>
<div class="flex justify-center items-center">
	<div class="h-52 flex justify-center items-center w-1/3 max-sm:w-11/12">
		<UForm :schema="schema" :state="state" class="space-y-4 w-full" @submit="onSubmit">
			<UFormGroup label="Name of this set" name="name" class="w-full">
				<UInput v-model="state.name" :autofocus="true"/>
			</UFormGroup>

			<UButton type="submit">
				Submit
			</UButton>
		</UForm>
	</div>
</div>

</template>
