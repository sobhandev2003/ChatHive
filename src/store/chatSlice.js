import { createSlice } from "@reduxjs/toolkit";

const chatSlice = createSlice({
  name: "chat",
  initialState: { messages: [], typing: {} },
  reducers: {
    setMessages: (state, action) => {
      state.messages = action.payload;
    },
    addMessage: (state, action) => {
      state.messages.push(action.payload);
    },
    setTyping: (state, action) => {
      state.typing[action.payload.userId] = action.payload.state;
    },
  },
});

export const { setMessages, addMessage, setTyping } = chatSlice.actions;
export default chatSlice.reducer;
