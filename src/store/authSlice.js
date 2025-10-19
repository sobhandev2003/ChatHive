import { createSlice } from "@reduxjs/toolkit";

const authSlice = createSlice({
  name: "auth",
  initialState: { isLogedIn: false, user: null, savedUsers: [] },
  reducers: {
    setIsLogedIn: (state, action) => {
      console.log("action.payload", action.payload);
      state.isLogedIn = action.payload;
    },
    setCredentials: (state, action) => {
      // console.log(action);
      state.user = action.payload;
      // state.token = action.payload.token;
    },
    upadteUserAvatar: (state, action) => {
      if (state.user) {
        state.user={...state.user, avatarUrl:action.payload};
      }
    },

    logoutUser: (state) => {
      state.user = null;
      state.token = null;
    },
    saveUser: (state, action) => {
      state.savedUsers.push(action.payload);
    },
  },
});

export const { setIsLogedIn, setCredentials, logoutUser, saveUser,upadteUserAvatar } = authSlice.actions;
export default authSlice.reducer;
