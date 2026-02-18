import { create } from "zustand";

export const useDmStore = create((set) => ({
  currentUser: null,
  dms: [],
  activeDm: null,
  messages: [],

  setCurrentUser: (user) => set({ currentUser: user }),

  setDms: (dms) => set({ dms: Array.isArray(dms) ? dms : [] }),

  setActiveDm: (dm) => set({ activeDm: dm }),

  setMessages: (messages) =>
    set({
      messages: Array.isArray(messages) ? messages : []
    }),

  addMessage: (message) =>
    set((state) => ({
      messages: Array.isArray(state.messages)
        ? [...state.messages, message]
        : [message]
    }))
}));
