import { useDispatch } from 'react-redux';
import React, { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Chat from "./pages/Chat";
import { useSelector } from "react-redux";
import { fetchUser } from "./services/authService";
import { setCredentials } from './store/authSlice';
// Import fetchUser from its module (update the path as needed)

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const user = useSelector((state) => state.auth.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    // console.log("user changed",user);
    if (user) {
      setIsLoggedIn(true);
      navigate("/");
    }


  }, [user])

  useEffect(() => {
    // console.log("App mounted");

    const fetchData = async () => {
      try {
        const res = await fetchUser();
        // console.log(res);
        dispatch(setCredentials(res))

      } catch (error) {

      }
    };
    if (!user) {
      fetchData();
    }


  }, [])
  return (
    <>
      <Routes>
        {/* <Route path="/" element={<Chat />} /> */}
        {

          isLoggedIn ? (
            <>
              <Route path="/" element={<Chat />} />
            </>
          ) : (
            <>
              <Route path="/" element={<Login />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
            </>

          )
        }
      </Routes>

    </>
  );
}
