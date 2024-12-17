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

    // if (user.value && to?.name === 'login') {
    //     return navigateTo('/');
    // }
    if (!user.value && to?.name !== 'login') {
        abortNavigation();
        return navigateTo('/login');
    }
})