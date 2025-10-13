import { createSlice } from "@reduxjs/toolkit";

const authSlice = createSlice({
  name: "auth",
  initialState: { isLogedIn:false,user: null,savedUsers: [] },
  reducers: {
    setIsLogedIn: (state, action) => {
      console.log("action.payload",action.payload);
      state.isLogedIn = action.payload;
    },
    setCredentials: (state, action) => {
  console.log(action);
  
      state.user = action.payload;
      // state.token = action.payload.token;
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

export const {setIsLogedIn, setCredentials, logoutUser,saveUser } = authSlice.actions;
export default authSlice.reducer;
