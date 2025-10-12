import api from "./api";

export const fetchMessages = async (otherUserId) => {
  // console.log("OterUser 👉",otherUserId);
  
  if (!otherUserId) {
    return;
  }
  try {
    const res = await api.get(`/messages/${otherUserId}`);
    return res.data.messages;
  } catch (error) {
    console.error("Fetch messages error:", error);
    throw error;

  }
};

export const uploadFile = async (file) => {
  const formData = new FormData();
  formData.append("file", file);
  const res = await api.post("/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data.url;
};

export const getRecentContacts = async () => {
  try {
    const res = await api.get("/messages/recent-contacts");
    // console.log("Recent contacts response:", res.data);

    return res.data.contacts;

  } catch (error) {
    console.error("Error fetching recent contacts:", error);
    throw error;

  }
}
