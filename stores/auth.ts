import { defineStore } from 'pinia';
import type { User } from '~/types/user';

export const useAuthStore = defineStore('auth', {
  state: () => {
    return {
      authenticated: false,
      user_id: 0,
      username: ""
    }
  },
  actions: {
    logIn(user:User) {
      const storedUser = useCookie<User>('user', {
        maxAge: 365*24*60*60
      });
      this.authenticated = true; // set authenticated  state value to true
      this.user_id = user.id,
      this.username = user.name
      storedUser.value = {
        id: user.id,
        email: user.email,
        imageURL: user.imageURL,
        name: user.name
      }
    },
    logOut() {
      const user = useCookie('user');

      this.authenticated = false; // set authenticated  state value to false
      user.value = null
    },
  }
});