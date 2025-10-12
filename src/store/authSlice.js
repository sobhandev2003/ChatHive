import { createSlice } from "@reduxjs/toolkit";

const authSlice = createSlice({
  name: "auth",
  initialState: { isLogedIn:false,user: null, token: null,savedUsers: [] },
  reducers: {
    setIsLogedIn: (state, action) => {
      console.log("action.payload",action.payload);
      state.isLogedIn = action.payload;
    },
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

export const {setIsLogedIn, setCredentials, logout,saveUser } = authSlice.actions;
export default authSlice.reducer;
