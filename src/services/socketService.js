import WebSocket from "isomorphic-ws"; // or "ws" for Node tests
import api from "./api";
let socket;

export const connectSocket = async () => {
  // console.log("Connecting WebSocket with token:", token);

  try {
    const respose = await api.get("/auth/connect");
    // console.log("WebSocket connection response:", respose);
    if (respose.data?.wsUrl) {
      socket = new WebSocket(respose.data.wsUrl);
      return socket;
    }
    throw new Error("WebSocket URL not found in response");

  } catch (error) {
    console.error("WebSocket connection error:", error);
    throw error;

  }

};

export const sendMessage = async (to, content, msgKey, contentType = "text") => {
  if (!to || !content || !msgKey) {
    console.error("Invalid parameters for sendMessage:", { to, content, msgKey });
    return;

  }
  socket?.send(JSON.stringify({ type: "direct_message", to, msgKey, content, contentType }));


};

export const sendTyping = (to, state) => {
  socket?.send(JSON.stringify({ type: "typing", to, state }));
};

export const markRead = (selectedUserId) => {
  if (!selectedUserId) return;
  try {
  socket?.send(JSON.stringify({ type: "read", selectedUserId }));
  } catch (error) {
    console.error("Mark read error:", error);
    throw error;
  }
};
