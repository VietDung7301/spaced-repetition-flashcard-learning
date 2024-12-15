<template>

</template>

<script setup lang="ts">
    const { logOut } = useAuthStore()

    logOut()
    navigateTo("/")
</script>