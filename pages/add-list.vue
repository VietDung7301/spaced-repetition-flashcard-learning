<script setup lang="ts">
    const submit = () => {
        $fetch("/api/list", {
            method: "POST",
            body: {
                name: "test",
                user_id: 1
            }
        })
    }
</script>

<template>
    <UButton @click="submit">Add</UButton>
</template>

