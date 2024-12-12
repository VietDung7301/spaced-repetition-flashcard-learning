<template>
    xin chao
    {{ setList?.length }}
    <div v-for="set in setList" class="basis-1/2">
        <UCard class="flex flex-col justify-center">
            {{ set.name }}
        </UCard>
    </div>
</template>

<script setup lang="ts">
import type { CardSet } from '~/types/user';
const { user_id } = storeToRefs(useAuthStore());

const { data: setList } = await useFetch<CardSet[]>("/api/card_set", {
    method: "GET",
    body: { user_id: user_id }
})
</script>