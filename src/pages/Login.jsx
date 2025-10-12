import React from "react";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { login } from "../services/authService";
import { setCredentials } from "../store/authSlice";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const dispatch = useDispatch();

  const handleSubmit  = async (e) => {
    e.preventDefault();
      setLoading(true);
    setError("");
    try {
      const data = await login(email, password);
      // console.log(data);
      dispatch(setCredentials(data));
      
      
    } catch (error) {
      setError(error?.response?.data?.error||error?.message||"Login failed. Please check your credentials.");
      console.error("Login failed:", error);
      
    }finally {
      setLoading(false);
    }

    // const data = await login(email, password);
    // localStorage.setItem("token", data.token);
    // dispatch(setCredentials(data));
  };

  return (
  <div className="min-h-screen flex items-center justify-center bg-black text-white px-4">
      <div className="w-full max-w-md bg-neutral-900 rounded-2xl shadow-2xl p-8">
        <h2 className="text-3xl font-semibold text-center mb-6">Welcome Back</h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium mb-2">Email</label>
            <input
              type="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@example.com"
              className="w-full px-4 py-2 rounded-lg bg-neutral-800 border border-neutral-700 focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Password</label>
            <input
              type="password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              className="w-full px-4 py-2 rounded-lg bg-neutral-800 border border-neutral-700 focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
            />
          </div>

          {error && (
            <p className="text-red-500 text-sm text-center">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 rounded-lg text-lg font-medium transition ${
              loading
                ? "bg-purple-700 cursor-not-allowed"
                : "bg-purple-600 hover:bg-purple-700"
            }`}
          >
            {loading ? "Signing In..." : "Login"}
          </button>
        </form>

        <p className="text-center text-sm mt-6 text-neutral-400">
          Don’t have an account?{" "}
          <a href="/signup" className="text-purple-500 hover:underline">
            Sign Up
          </a>
        </p>
      </div>
    </div>
  );
}
