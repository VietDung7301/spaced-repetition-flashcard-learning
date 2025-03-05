<template>
	<div v-if="editor" class="flex gap-x-1 border-gray-50 dark:border-gray-800 dark:bg-gray-800 bg-gray-100 pl-2 rounded-t-md pt-1">
		<button 
			@click="editor.chain().focus().toggleBold().run()"
			:disabled="!editor.can().chain().focus().toggleBold().run()" 
			:class="{ 'bg-gray-200 dark:bg-gray-700': editor.isActive('bold') }"
			class="rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
			tabindex="-1" >
			<UIcon name="i-material-symbols:format-bold" class="w-4 h-4 text-gray-400 dark:text-gray-500"></UIcon>
		</button>
		<button 
			@click="editor.chain().focus().toggleItalic().run()"
			:disabled="!editor.can().chain().focus().toggleItalic().run()"
			:class="{ 'bg-gray-200 dark:bg-gray-700': editor.isActive('italic') }"
			class="rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
			tabindex="-1" >
			<UIcon name="i-material-symbols:format-italic" class="w-4 h-4 text-gray-400 dark:text-gray-500"></UIcon>
		</button>
		<button 
			@click="editor.chain().focus().toggleStrike().run()"
			:disabled="!editor.can().chain().focus().toggleStrike().run()"
			:class="{ 'bg-gray-200 dark:bg-gray-700': editor.isActive('strike') }"
			class="rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
			tabindex="-1" >
			<UIcon name="i-material-symbols:format-strikethrough" class="w-4 h-4 text-gray-400 dark:text-gray-500"></UIcon>
		</button>
	</div>
	<editor-content :editor="editor" class="" />
</template>

<script>
import StarterKit from '@tiptap/starter-kit'
import { Editor, EditorContent } from '@tiptap/vue-3'

export default {
	components: {
		EditorContent,
	},

	props: {
		modelValue: {
			type: String,
			default: '',
		},
	},

	emits: ['update:modelValue'],

	data() {
		return {
			editor: null,
		}
	},

	watch: {
		modelValue(value) {
			// HTML
			const isSame = this.editor.getHTML() === value

			if (isSame) {
				return
			}

			this.editor.commands.setContent(value, false)
		},
	},

	mounted() {
		this.editor = new Editor({
			extensions: [
				StarterKit,
			],
			content: this.modelValue,
			onUpdate: () => {
				// HTML
				this.$emit('update:modelValue', this.editor.getHTML())
			},
		})
	},

	beforeUnmount() {
		this.editor.destroy()
	},
}
</script>
