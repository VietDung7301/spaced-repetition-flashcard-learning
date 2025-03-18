<script setup lang="ts">
import type { User } from '~/types/type';

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
		email: "",
		speakerId: 13,
	}, {
		id: 2,
		name: "Trammmmmm",
		imageURL: "/tram.jpg",
		email: "",
		speakerId: 20
	}
]
</script>

<template>
<div class="flex justify-center pt-5">
	<div class="w-3/5 flex flex-row space-x-8 max-sm:w-11/12 max-sm:space-x-2">
		<div v-for="user in userList" class="basis-1/2">
			<UCard class="flex flex-col justify-center">
				<template #header>
					<div class="font-bold text-xl justify-center flex">{{ user.name }}</div>
				</template>
				<div class="h-96 overflow-hidden max-sm:h-32">
					<img class="min-w-full min-h-full object-contain" :src=user.imageURL :alt=user.name>
				</div>
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