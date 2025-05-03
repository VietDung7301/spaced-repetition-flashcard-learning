import { defineStore } from 'pinia';
import type { User } from '~/types/type';

export const useAuthStore = defineStore('auth', {
  state: () => {
    return {
      authenticated: false,
      user_id: 0,
      username: "",
      userAvatar: "",
      speakerId: 0,
      isVoiceOffline: false,
      voiceUrl: useRuntimeConfig().public.VOICE_URL,
    }
  },
  actions: {
    logIn(user:User) {
      const storedUser = useCookie<User>('user', {
        maxAge: 365*24*60*60
      });
      this.authenticated = true; // set authenticated  state value to true
      this.user_id = user.id
      this.username = user.name
      this.userAvatar = user.imageURL
      this.speakerId = user.speakerId
      this.isVoiceOffline = user.isVoiceOffline
      this.voiceUrl = user.isVoiceOffline ? useRuntimeConfig().public.OFFLINE_VOICE_URL : useRuntimeConfig().public.VOICE_URL
      storedUser.value = {
        id: user.id,
        email: user.email,
        imageURL: user.imageURL,
        name: user.name,
        speakerId: user.speakerId,
        isVoiceOffline: user.isVoiceOffline,
      }
    },
    logOut() {
      const user = useCookie('user');

      this.authenticated = false; // set authenticated  state value to false
      this.user_id = 0
      this.username = ""
      this.userAvatar = ""
      user.value = null
    },
    changeVoiceUrl() {
      const user = useCookie<User>('user');
      this.isVoiceOffline = !this.isVoiceOffline
      this.voiceUrl = this.isVoiceOffline ? useRuntimeConfig().public.OFFLINE_VOICE_URL : useRuntimeConfig().public.VOICE_URL
      user.value.isVoiceOffline = this.isVoiceOffline
    }
  }
});
