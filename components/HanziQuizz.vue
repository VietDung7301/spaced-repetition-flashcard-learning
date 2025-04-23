<script setup lang="ts">
import { onMounted } from 'vue';
const props = defineProps(["width", "height", "character"]);

let writer;

onMounted(async () => {
	const HanziWriterModule = await import('hanzi-writer');
	const HanziWriter = HanziWriterModule.default;
	writer = HanziWriter.create('character-target-div', props.character, {
		width: props.width,
		height: props.height,
		showCharacter: false,
		padding: 5
	});

	writer.quiz()
});
</script>

<template>
  <ClientOnly>
	
	<div id="character-target-div"></div>
  </ClientOnly>
</template>