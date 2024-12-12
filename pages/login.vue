<script setup lang="ts">
import type { User } from '~/types/user';

const { logIn } = useAuthStore()
const handleOnLogin = (user:User) => {
	logIn(user)
	navigateTo("/")
}

const userList = [
	{
		id: 1,
		name: "Viet Dung",
		imageURL: "/dung.png",
		email: ""
	}, {
		id: 2,
		name: "Trammmmmm",
		imageURL: "/dung.png",
		email: ""
	}
]
</script>

<template>
<div class="flex justify-center">
	<div class="w-3/5 flex flex-row  space-x-8">
		<div v-for="user in userList" class="basis-1/2">
			<UCard class="flex flex-col justify-center">
				<template #header>
					<div class="font-bold text-xl justify-center flex">{{ user.name }}</div>
				</template>
				<img class="w-full" :src=user.imageURL :alt=user.name>
				<template #footer>
					<div class="font-bold text-xl mb-2 justify-center flex">
						<UButton @click="handleOnLogin(user)">Login</UButton>
					</div>
				</template>
			</UCard>
		</div>
	</div>
</div>
</template>