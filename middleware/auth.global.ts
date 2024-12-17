import { useAuthStore } from '~/stores/auth';
import type { User } from '~/types/type';

export default defineNuxtRouteMiddleware((to) => {
    const { authenticated, user_id, username, userAvatar } = storeToRefs(useAuthStore());
    const user = useCookie<User>("user")

    if (user.value && user.value !== null) {
        authenticated.value = true
        username.value = user.value.name
        user_id.value = user.value.id
        userAvatar.value = user.value.imageURL
    }
    console.log("to", to)

    if (user.value && to.path === '/login') {
        return navigateTo('/');
    }
    if (!user.value && to.path !== '/login') {
        return navigateTo('/login');
    }
})