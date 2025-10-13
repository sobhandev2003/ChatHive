import api from "./api";

export const signup = async (name, email, password) => {
  try {
    const res = await api.post("/auth/signup", { name, email, password });
    return res.data;
  } catch (error) {
    console.error("Signup error:", error);
    throw error;
  }
};

export const login = async (email, password) => {
  try {
    const res = await api.post("/auth/login", { email, password });
    // localStorage.setItem("token", res.data.token);
    return res.data;

  } catch (error) {
    console.error("Login error:", error);
    throw error;

  }

};

export const logout = async () => {
  try {
    const res = await api.get("/auth/logout");
    // localStorage.removeItem("token");
    return res.data;
  } catch (error) {
    console.error("Logout error:", error);
    throw error;
  }
}

export const fetchUser = async () => {
  // console.log("Fetching user with token:");

  try {

    const res = await api.get("/auth");
    return res.data;

  } catch (error) {
    console.error("Fetch user error:", error);

  }
}

export const searchUsers = async (query) => {
  try {
    const res = await api.get(`/auth/search/?q=${query}`);
    return res.data;

  } catch (error) {
    console.error("Search users error:", error);
    throw error;

  }
}
