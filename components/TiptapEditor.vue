<template>
	<div v-if="editor" class="mb-2 flex space-x-2 border-b pb-2">
		<button 
			@click="editor.chain().focus().toggleBold().run()"
			:disabled="!editor.can().chain().focus().toggleBold().run()" 
			:class="{ 'bg-gray-100': editor.isActive('bold') }"
			class="p-2 rounded hover:bg-gray-200 transition-colors">
			<UIcon name="i-material-symbols:format-bold"></UIcon>
		</button>
		<button 
			@click="editor.chain().focus().toggleItalic().run()"
			:disabled="!editor.can().chain().focus().toggleItalic().run()"
			:class="{ 'bg-gray-100': editor.isActive('italic') }"
			class="p-2 rounded hover:bg-gray-200 transition-colors">
			<UIcon name="i-material-symbols:format-italic"></UIcon>
		</button>
		<button 
			@click="editor.chain().focus().toggleStrike().run()"
			:disabled="!editor.can().chain().focus().toggleStrike().run()"
			:class="{ 'bg-gray-100': editor.isActive('strike') }"
			class="p-2 rounded hover:bg-gray-200 transition-colors">
			<UIcon name="i-material-symbols:format-strikethrough"></UIcon>
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

<style module>
.tiptap {
	padding: 1rem;
	border: 1px solid #e2e8f0;
}
</style>