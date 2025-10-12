import { createSlice } from "@reduxjs/toolkit";

const authSlice = createSlice({
  name: "auth",
  initialState: { user: null, token: null,savedUsers: [] },
  reducers: {
    setCredentials: (state, action) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
    },
    saveUser: (state, action) => {
      state.savedUsers.push(action.payload);
    },
  },
});

export const { setCredentials, logout,saveUser } = authSlice.actions;
export default authSlice.reducer;
