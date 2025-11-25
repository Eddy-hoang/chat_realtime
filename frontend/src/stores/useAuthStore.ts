import {create} from 'zustand'
import {toast} from 'sonner'
import { authService } from '@/services/authServices'
import type { AuthState } from '@/types/store'

export const useAuthStore = create<AuthState> ((set,get)=>({
    accessToken : null,
    user : null,
    loading : false,

    signUp: async (username, password, email, firstname, lastname) => {
        try {
            set({loading: true})

            await authService.signUp(username, password, email, firstname, lastname);
            toast.success("Sign up success!")
        } catch (error) {
            console.error(error);
            toast.error('Sign up not success')
        } finally{
            set({ loading: false});
        }
    },

    signIn: async (username, password) => {
        try {
            set({loading: true});

            const {accessToken} = await authService.signIn(username, password);
            set({accessToken});

            toast.success("Welcome back!")
        } catch (error) {
            console.error(error);
            toast.error("Sign in not success!")
        }
    }

}));