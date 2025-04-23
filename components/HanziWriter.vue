<template>
	<div ref="hanziWriterTarget" :style="{ width: `${options.width}px`, height: `${options.height}px` }">
	</div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch, shallowRef } from 'vue';
// Import HanziWriter dynamically ONLY on the client-side within onMounted
// This avoids SSR errors.

// Define props for customization
const props = defineProps({
	character: {
		type: String,
		required: true,
	},
	options: {
		type: Object,
		default: () => ({
			width: 100,
			height: 100,
			padding: 5,
			showOutline: true,
			showCharacter: true,
			strokeAnimationSpeed: 1,
			delayBetweenStrokes: 100,
			// Add any other hanzi-writer options here
			// Example: Load custom data
			// charDataLoader: HanziWriter.loadCharacterData // See note below
		}),
	},
});

// Ref to target the div element
const hanziWriterTarget = ref(null);
// Use shallowRef for the writer instance as its internals don't need deep reactivity
const writer = shallowRef(null);

// Function to initialize or update the writer
const initOrUpdateWriter = async () => {
	// Ensure this runs only on the client
	if (process.client && hanziWriterTarget.value) {
		// Dynamically import HanziWriter here
		const HanziWriter = (await import('hanzi-writer')).default;

		// Optional: Load character data if needed
		// Make sure hanzi-writer-data is installed
		// Example:
		// const characterData = await HanziWriter.loadCharacterData(props.character);
		// if (!characterData) {
		//   console.error(`Could not load character data for ${props.character}`);
		//   return; // Or handle error appropriately
		// }
		// --- or --- define a loader in options:
		// props.options.charDataLoader = (char, onComplete) => {
		//   // Implement your loading logic here if needed, often using HanziWriter.loadCharacterData
		//   // This example uses the default built-in loader if not specified
		//   const defaultLoader = HanziWriter.loadCharacterData;
		//   defaultLoader(char)
		//      .then(data => onComplete(data))
		//      .catch(err => console.error("Failed to load char data:", err));
		// };


		// If a writer instance already exists, update it or destroy and recreate
		if (writer.value) {
			// Option 1: Update character (if only character changed)
			// writer.value.setCharacter(props.character);

			// Option 2: Destroy and recreate if options might have changed (safer)
			// HanziWriter doesn't have an official destroy method. Removing the target element
			// during component unmount handles cleanup. For updates, we might need to clear the container.
			hanziWriterTarget.value.innerHTML = ''; // Clear previous content
			writer.value = HanziWriter.create(hanziWriterTarget.value, props.character, props.options);
		} else {
			// Create a new instance
			writer.value = HanziWriter.create(hanziWriterTarget.value, props.character, props.options);
		}
	}
};

// Initialize on mount
onMounted(() => {
	initOrUpdateWriter();
});

// Watch for prop changes to update the writer
watch(() => props.character, () => {
	initOrUpdateWriter();
});

watch(() => props.options, () => {
	initOrUpdateWriter();
}, { deep: true }); // Use deep watch if options object might change internally

// Cleanup: Although HanziWriter lacks a formal `.destroy()`,
// removing the component (and its target div) usually suffices.
// Setting the ref to null helps garbage collection.
onBeforeUnmount(() => {
	writer.value = null;
	// Optional: Explicitly clear the div just in case
	if (hanziWriterTarget.value) {
		hanziWriterTarget.value.innerHTML = '';
	}
});

// Expose methods if needed (e.g., to trigger animations from parent)
defineExpose({
	animate: () => writer.value?.animateCharacter(),
	quiz: (quizOptions) => writer.value?.quiz(quizOptions),
	getWriterInstance: () => writer.value // To access the raw instance if necessary
});
</script>

<style scoped>
/* Add any specific styles for your container if needed */
div {
	display: inline-block;
	/* Or block, depending on layout needs */
	border: 1px solid #eee;
	/* Example border */
}
</style>