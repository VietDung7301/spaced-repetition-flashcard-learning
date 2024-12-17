import { useAuthStore } from '~/stores/auth';
import type { User } from '~/types/type';

export default defineNuxtRouteMiddleware((to) => {
    const { authenticated, user_id, username, userAvatar } = storeToRefs(useAuthStore());
    const user = useCookie<User>("user", {
        default: () => <User>{
            id: NaN,
            name: "",
            email: "",
            imageURL: "",
        }
    })

    if (user.value && !Number.isNaN(user.value.id)) {
        authenticated.value = true
        username.value = user.value.name
        user_id.value = user.value.id
        userAvatar.value = user.value.imageURL
    }
    console.log("to", to, "user cookie", user.value)

    // if (user.value && to.path === '/login') {
    //     return navigateTo('/');
    // }
    if (Number.isNaN(user.value.id) && to.path !== '/login') {
        console.log("need to login again")
        return navigateTo('/login');
    }
})