import React, { use, useId, useRef, useState } from "react";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { connectSocket, markRead, sendMessage } from "../services/socketService";
import { addMessage } from "../store/chatSlice";
import { Send, Search, MoreVertical, ArrowLeft } from "lucide-react";
import { logout, searchUsers, updateProfilePhoto } from "../services/authService";
import { fetchMessages, getRecentContacts } from "../services/messageService";
import { v4 as uuidv4 } from 'uuid'
import { logoutUser, upadteUserAvatar } from "../store/authSlice";
import { useNavigate } from "react-router-dom";

export default function Chat() {
  const chatRef = useRef(null);
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);
  const [searchQueryMatchUser, setSearchQueryMatchUser] = useState([]);
  const [recentMassgesContacts, setRecentMassgesContacts] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [text, setText] = useState("");
  const dispatch = useDispatch();
  const token = localStorage.getItem("token");
  const [allmessages, setAllMessages] = useState([]);
  const [fillteredMessages, setFilteredMessages] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const [isUserScrolledUp, setIsUserScrolledUp] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  //Fetch messages when selected user changes
  const isMobileView = typeof window !== "undefined" && window.innerWidth < 768;
  // console.log("Is mobile", isMobileView);

  const [showSidebar, setShowSidebar] = useState((!selectedUser && isMobileView) || !isMobileView);

  const handelLogout = async () => {
    await logout();
    dispatch(logoutUser());

  }

  const handelProfilePhotoChange = async (e) => {

    const file = e.target.files[0];
    if (!file) return;
    // Example: upload logic (replace with your API)
    const res = await updateProfilePhoto(file);
    // let updatedUser= {...user, avatarUrl:res.url};
    // Update user in Redux store
    dispatch(upadteUserAvatar(res.url));
  }
  // detect when user manually scrolls up
  const handleScroll = () => {
    const el = chatRef.current;
    if (!el) return;
    const atBottom = el.scrollHeight - el.scrollTop <= el.clientHeight + 10;
    setIsUserScrolledUp(!atBottom);
  };
  //Handle search input change
  const handleSearch = async (e) => {
    const query = e.target.value.toLowerCase();
    try {
      const res = await searchUsers(query);
      // console.log("Search results:", res);
      setSearchQueryMatchUser(res.users);

    } catch (error) {
      console.error("Search error:", error);


    }
  }

  //Hande send message
  const handleSend = async () => {
    const to = selectedUser?.id || selectedUser?._id;
    const msgKey = uuidv4(); // Generate a unique message key
    sendMessage(to, text, msgKey);
    // Update local state to show sent message immediately
    const newMessage = {
      msgKey: msgKey, // Temporary ID for frontend
      from: user._id,
      to: to,
      content: text,
      timestamp: new Date().toISOString(),
    };
    setAllMessages((prevMessages) => [...prevMessages, newMessage]);
    setText("");
  }

  //Fetch recent contacts who have chatted with login user
  const fetchRecentContacts = async () => {
    try {
      const res = await getRecentContacts();
      // console.log("Recent contacts:", res);
      if (res && res.length > 1) {
        res.sort((a, b) => {
          if (!a?.from || !b?.from || !a?.to || !b?.to) {
            return 0;
          }
          const getMessageTime = (msg) => {
            // console.log("Msg for sorting:", msg);

            // If message is from the logged-in user → use createdAt
            if (msg.from?._id === user._id) {
              return new Date(msg.createdAt || msg.timestamp);
            }
            // If message is from the other user → use deliveredAt (or fallback)
            return new Date(msg.deliveredAt || msg.timestamp || msg.createdAt);
          };
          return getMessageTime(b) - getMessageTime(a);
        })
      }
      setRecentMassgesContacts(res);
      // setSelectedUser(res[0]);

    } catch (error) {
      console.error("Error fetching recent contacts:", error);
    }

  }

  //WebSocket connection and message handling
  useEffect(() => {
    // console.log("user 👉", user);

    if (!user) return;

    let ws;
    // Setup WebSocket connection
    const setupSocket = async () => {
      console.log("Tryyin to connect---");

      ws = await connectSocket();
      ws.onopen = () => {
        console.log("Connected to WebSocket");
      };
      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        // console.log("Received message:", data);
        //Handle massage based on type

        if (data.type === "message") {
          fetchRecentContacts();
          // incoming messages
          setAllMessages((prevMessages) => [
            ...(Array.isArray(prevMessages) ? prevMessages : []),
            data?.payload,
          ]);
        }
        else if (data.type === "sent") {
          //message sent confirmation
          // console.log("Massege delivered", data.payload);

          setAllMessages((prevMessages) => {
            const updatedMessages = (Array.isArray(prevMessages) ? prevMessages : []).map((msg) => {
              if (msg.msgKey && data.payload.frontendKey && msg.msgKey === data.payload.frontendKey) {
                return data.payload.message // Merge the updated fields
              }
              return msg;
            });
            return updatedMessages;
          });
          // console.log("selectedUser", selectedUser);
          // selectedUser && markRead(selectedUser.id || selectedUser._id);
        }
        else if (data.type === "delivered") {
          //message sent confirmation
          // console.log("Massege delivered", data.payload);
          setAllMessages((prevMessages) => {
            const updatedMessages = (Array.isArray(prevMessages) ? prevMessages : []).map((msg) => {
              if (msg._id && data.payload.message && msg._id === (data.payload.message._id || data.payload.message.id)) {
                return data.payload.message // Merge the updated fields
              }
              return msg;
            });
            return updatedMessages;
          });
          // console.log("selectedUser", selectedUser);

          // selectedUser && markRead(selectedUser.id || selectedUser._id);
        }
        else if (data.type === "read") {
          //message read confirmation
          // console.log("Massege read", data.payload);
          setAllMessages((prevMessages) => {
            const updatedMessages = (Array.isArray(prevMessages) ? prevMessages : []).map((msg) => {
              if (msg._id && data.payload.message && msg._id === (data.payload.message._id || data.payload.message.id)) {
                return data.payload.message // Merge the updated fields
              }
              return msg;
            });
            return updatedMessages;
          })
        }
        else if (data.type === "online_users") {
          // console.log(`🟢 User is online`, data.payload);
          setOnlineUsers(new Set(data.payload.userIds));
        }


        ws.onerror = (error) => {
          console.error("WebSocket error:", error);
        };
        ws.onclose = () => {
          console.log("WebSocket connection closed");
        }
      }

    };
    setupSocket();


  }, [user]);

  //Get recent contacts who have chatted with login user
  useEffect(() => {
    if (!user) return;

    fetchRecentContacts();
  }, [user])

  useEffect(() => {

    if (!selectedUser) return;
    if (!user) return;
    // console.log("Selected User", selectedUser);

    const selectedUserId = selectedUser.id || selectedUser._id;
    const loginUserId = user.id || user._id;
    // Filter messages between logged-in user and selected user
    const filtered = allmessages?.filter((msg) => {

      //Recived From selected user
      if (msg.from === selectedUserId) {
        return msg.to === loginUserId;
      }
      //Sent to selected user
      else if (msg.to === selectedUserId) {
        return msg.from === loginUserId;
      }
      else {
        return false;
      }
    });
    // Sort messages WhatsApp-style
    filtered?.sort((a, b) => {
      // console.log("selectedUser", selectedUser);
      selectedUser && markRead(selectedUser.id || selectedUser._id);
      const getMessageTime = (msg) => {
        // If message is from the logged-in user → use createdAt
        if (msg.from === loginUserId) {
          return new Date(msg.createdAt || msg.timestamp);
        }
        // If message is from the other user → use deliveredAt (or fallback)
        return new Date(msg.deliveredAt || msg.timestamp || msg.createdAt);
      };

      return getMessageTime(a) - getMessageTime(b);
    });
    setFilteredMessages(filtered);
  }, [allmessages])

  useEffect(() => {

    setShowSidebar((!selectedUser && isMobileView) || !isMobileView);

    if (!selectedUser) {
      return;
    }



    markRead(selectedUser.id || selectedUser._id);
    const fetchMessagesForSelectedUser = async () => {
      setAllMessages([]);
      if (!selectedUser) return;
      const otherUserId = selectedUser.id || selectedUser._id;
      try {
        const res = await fetchMessages(otherUserId);
        setAllMessages(res);
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    }
    fetchMessagesForSelectedUser();
  }, [selectedUser]);

  // useEffect(() => {
  //   console.log("Recent contacts updated:", recentMassgesContacts);

  // }, [recentMassgesContacts])
  // detect when user manually scrolls up


  // always scroll to bottom if user not scrolled up
  useEffect(() => {
    const el = chatRef.current;
    if (!el || isUserScrolledUp) return;
    el.scrollTop = el.scrollHeight;
  }, [fillteredMessages, isUserScrolledUp]);



  return (
    // <div className="h-screen flex flex-col md:flex-row bg-gradient-to-br from-purple-900 via-black to-neutral-900 text-white font-sans">
    //   {/* Sidebar */}
    //   <div className="w-full md:w-1/3 lg:w-1/4 bg-neutral-900 border-b md:border-b-0 md:border-r border-neutral-800 flex flex-col shadow-lg h-[50vh] md:h-auto">
    //     {/* Header */}
    //     <div className="flex items-center justify-between p-3 md:p-4 border-b border-neutral-800 bg-gradient-to-r from-purple-800 to-neutral-900 relative">
    //       <h2 className="text-xl md:text-2xl font-bold tracking-wide text-purple-300">ChatHive</h2>
    //       <div className="relative">
    //         <button
    //           className="p-2 rounded-full hover:bg-neutral-800 transition"
    //           onClick={() => setShowMenu((prev) => !prev)}
    //         >
    //           <MoreVertical className="text-neutral-400" />
    //         </button>
    //         {showMenu && (
    //           <div className="absolute right-0 mt-2 w-[250px] bg-neutral-900 border border-neutral-800 rounded-lg shadow-lg z-10">
    //             <div className="px-4 py-2 border-b border-neutral-800">
    //               <div className="flex items-center gap-2">
    //                 <img
    //                   src={user?.avatarUrl || `https://ui-avatars.com/api/?name=${user?.name}`}
    //                   alt={user?.name}
    //                   className="w-8 h-8 rounded-full object-cover border-2 border-purple-700"
    //                 />
    //                 <div>
    //                   <p className="font-medium text-sm">{user?.name}</p>
    //                   <p className="text-xs text-neutral-400">{user?.email}</p>
    //                 </div>
    //               </div>
    //             </div>
    //             <label
    //               className="w-full text-left px-4 py-2 hover:bg-neutral-800 transition text-sm cursor-pointer block"
    //             >
    //               <input
    //                 type="file"
    //                 accept="image/*"
    //                 className="hidden"
    //                 onChange={handelProfilePhotoChange}
    //               />
    //               Upload New Profile Photo
    //             </label>
    //             <button
    //               className="w-full text-left px-4 py-2 hover:bg-neutral-800 transition text-sm text-red-400"
    //               onClick={() => {
    //                 handelLogout();
    //               }}
    //             >
    //               Log Out
    //             </button>
    //           </div>
    //         )}
    //       </div>
    //     </div>

    //     <div className="p-3">
    //       <div className="flex items-center bg-neutral-800 rounded-lg px-3 py-2 shadow-inner">
    //         <Search className="w-4 h-4 text-neutral-400 mr-2" />
    //         <input
    //           type="text"
    //           placeholder="Search..."
    //           className="bg-transparent w-full text-sm text-white focus:outline-none"
    //           onChange={handleSearch}
    //         />
    //       </div>
    //     </div>

    //     {/* User List */}
    //     <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-neutral-700">
    //       {searchQueryMatchUser.length > 0 ? (
    //         // show search results if available
    //         searchQueryMatchUser.map((u) => (
    //           <div
    //             key={u._id || u.id}
    //             onClick={() =>
    //               setSelectedUser({
    //                 id: u._id,
    //                 name: u.name,
    //                 avatar: u?.avatarUrl || `https://ui-avatars.com/api/?name=${u.name}`,
    //               })
    //             }
    //             className={`flex items-center gap-3 p-3 cursor-pointer transition 
    //       ${selectedUser?.id === u._id ? "bg-purple-800/60" : "hover:bg-neutral-800/60"}`}
    //           >
    //             <img
    //               src={u?.avatarUrl || `https://ui-avatars.com/api/?name=${u.name}`}
    //               alt={u.name}
    //               className="w-10 h-10 rounded-full object-cover border-2 border-purple-700"
    //             />
    //             <div className="flex-1 overflow-hidden">
    //               <p className="font-medium truncate">{u.name}</p>
    //               <p className="text-sm text-neutral-400 truncate">{u.email}</p>
    //             </div>
    //           </div>
    //         ))
    //       ) : (
    //         // fallback: show recent contacts
    //         recentMassgesContacts?.map((massage) => {
    //           if (!massage?.from || !massage?.to) return null;
    //           const otherUser =
    //             massage?.from?._id === (user?._id || user?.id) ? massage?.to : massage?.from;
    //           return (
    //             <div
    //               key={massage.id || massage._id}
    //               onClick={() => setSelectedUser(otherUser)}
    //               className={`flex items-center gap-3 p-3 cursor-pointer transition 
    //       ${selectedUser.id === otherUser._id ? "bg-purple-800/60" : "hover:bg-neutral-800/60"}`}
    //             >
    //               <img
    //                 src={otherUser.avatarUrl || `https://ui-avatars.com/api/?name=${otherUser.name}`}
    //                 alt={otherUser.name}
    //                 className="w-10 h-10 rounded-full object-cover border-2 border-purple-700"
    //               />
    //               <div className="flex-1 overflow-hidden">
    //                 <p className="font-medium truncate">{otherUser.name}</p>
    //                 <p className="text-sm text-neutral-400 truncate">{massage.content}</p>
    //               </div>
    //             </div>
    //           );
    //         })
    //       )}
    //     </div>
    //   </div>

    //   {/* Chat Section */}
    //   {selectedUser && (selectedUser.id || selectedUser._id) ? (
    //     <div className="flex-1 flex flex-col min-h-0 bg-gradient-to-br from-neutral-900 via-black to-purple-900">
    //       {/* Chat Header */}
    //       <div className="flex items-center justify-between p-3 md:p-4 border-b border-neutral-800 bg-gradient-to-r from-purple-800 to-neutral-900 shadow">
    //         <div className="flex items-center gap-3">
    //           <img
    //             src={selectedUser.avatarUrl || `https://ui-avatars.com/api/?name=${selectedUser.name}`}
    //             alt={selectedUser.name}
    //             className="w-8 h-8 md:w-10 md:h-10 rounded-full object-cover border-2 border-purple-700"
    //           />
    //           <div>
    //             <p className="font-medium text-sm md:text-lg">{selectedUser.name}</p>
    //             <p className="text-xs text-neutral-400">
    //               {onlineUsers && onlineUsers.has(selectedUser.id || selectedUser._id)
    //                 ? "🟢 Online"
    //                 : "🔴 Offline"}
    //             </p>
    //           </div>
    //         </div>
    //         <MoreVertical className="text-neutral-400" />
    //       </div>

    //       {/* Messages */}
    //       {fillteredMessages && (
    //         <div
    //           className="flex-1 p-4 md:p-6 overflow-y-auto flex flex-col space-y-3 no-scrollbar min-h-0"
    //           onScroll={handleScroll}
    //           ref={chatRef}
    //         >
    //           {fillteredMessages.map((msg, index) => {
    //             const isSentByUser =
    //               msg?.from?.toString() === user?._id?.toString() || msg.from === user?._id;
    //             return (
    //               <div
    //                 key={msg.id || msg._id || index}
    //                 className={`flex ${isSentByUser ? "justify-start" : "justify-end"}`}
    //               >
    //                 <div
    //                   className={`px-4 py-2 rounded-2xl shadow-md max-w-[80%] md:max-w-xs ${isSentByUser
    //                     ? "bg-gradient-to-br from-purple-700 to-purple-500 text-white rounded-br-none"
    //                     : "bg-neutral-800 text-white rounded-bl-none"
    //                     }`}
    //                 >
    //                   {msg.content}
    //                   {isSentByUser && (
    //                     <span className="ml-2 text-xs align-bottom">
    //                       {!(msg.id || msg._id) && (
    //                         <span className="text-neutral-400" title="Sending...">
    //                           🕓
    //                         </span>
    //                       )}
    //                       {!msg.deliveredAt && (msg.id || msg._id) && (
    //                         <span className="text-neutral-400" title="Not delivered">
    //                           ✓
    //                         </span>
    //                       )}
    //                       {msg.deliveredAt && !msg.readAt && (
    //                         <span
    //                           className="text-neutral-400 cursor-pointer"
    //                           title={`Delivered: ${new Date(msg.deliveredAt).toLocaleString()}`}
    //                         >
    //                           ✓✓
    //                         </span>
    //                       )}
    //                       {msg.readAt && (
    //                         <span
    //                           className="text-green-400 cursor-pointer"
    //                           title={`Delivered: ${new Date(msg.deliveredAt).toLocaleString()}\nRead: ${new Date(
    //                             msg.readAt
    //                           ).toLocaleString()}`}
    //                         >
    //                           ✓✓
    //                         </span>
    //                       )}
    //                     </span>
    //                   )}
    //                 </div>
    //               </div>
    //             );
    //           })}
    //         </div>
    //       )}

    //       {/* Input */}
    //       <div className="p-3 md:p-4 flex items-center gap-3 border-t border-neutral-800 bg-neutral-900 sticky bottom-0">
    //         <input
    //           type="text"
    //           value={text}
    //           onChange={(e) => setText(e.target.value)}
    //           placeholder="Type a message..."
    //           className="flex-1 bg-neutral-800 text-white px-4 py-2 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500"
    //         />
    //         <button
    //           type="submit"
    //           className="bg-gradient-to-br from-purple-700 to-purple-500 hover:from-purple-800 hover:to-purple-600 p-3 rounded-full transition shadow"
    //           onClick={handleSend}
    //         >
    //           <Send className="w-5 h-5 text-white" />
    //         </button>
    //       </div>
    //     </div>
    //   ) : (
    //     <div className="flex-1 flex flex-col items-center justify-center bg-gradient-to-br from-neutral-900 via-black to-purple-900 p-6">
    //       <div className="text-center space-y-6">
    //         <div className="flex flex-col items-center">
    //           <span className="text-5xl md:text-6xl font-extrabold text-purple-400 drop-shadow-lg">💬</span>
    //           <h1 className="text-2xl md:text-4xl font-bold mt-4 text-purple-200">
    //             Welcome to <span className="text-purple-400">ChatHive</span>
    //           </h1>
    //         </div>
    //         <p className="text-base md:text-lg text-neutral-300 max-w-md mx-auto">
    //           Connect, chat, and collaborate in real-time.
    //           <br />
    //           Select a contact or search for users to start chatting!
    //         </p>
    //         <div className="flex justify-center">
    //           <span className="inline-block bg-purple-700/80 text-white px-6 py-2 rounded-full font-semibold shadow-lg">
    //             Start your conversation now 🚀
    //           </span>
    //         </div>
    //       </div>
    //     </div>
    //   )}
    // </div>

    <div className="h-screen flex flex-col md:flex-row bg-gradient-to-br from-purple-900 via-black to-neutral-900 text-white font-sans">
      {/* Sidebar */}
      {showSidebar && (
        <div className="w-full md:w-1/3 lg:w-1/4 bg-neutral-900 border-b md:border-b-0 md:border-r border-neutral-800 flex flex-col shadow-lg">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-neutral-800 bg-gradient-to-r from-purple-800 to-neutral-900 relative">
            <h2 className="text-xl sm:text-2xl font-bold tracking-wide text-purple-300">ChatHive</h2>
            <div className="relative">
              <button
                className="p-2 rounded-full hover:bg-neutral-800 transition"
                onClick={() => setShowMenu((prev) => !prev)}
              >
                <MoreVertical className="text-neutral-400" />
              </button>
              {showMenu && (
                <div className="absolute right-0 mt-2 w-[250px] bg-neutral-900 border border-neutral-800 rounded-lg shadow-lg z-10">
                  <div className="px-4 py-2 border-b border-neutral-800">
                    <div className="flex items-center gap-2">
                      <img
                        src={user?.avatarUrl || `https://ui-avatars.com/api/?name=${user?.name}`}
                        alt={user?.name}
                        className="w-8 h-8 rounded-full object-cover border-2 border-purple-700"
                      />
                      <div>
                        <p className="font-medium text-sm">{user?.name}</p>
                        <p className="text-xs text-neutral-400">{user?.email}</p>
                      </div>
                    </div>
                  </div>
                  <label className="w-full text-left px-4 py-2 hover:bg-neutral-800 transition text-sm cursor-pointer block">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handelProfilePhotoChange}
                    />
                    Upload New Profile Photo
                  </label>
                  <button
                    className="w-full text-left px-4 py-2 hover:bg-neutral-800 transition text-sm text-red-400"
                    onClick={handelLogout}
                  >
                    Log Out
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Search */}
          <div className="p-3">
            <div className="flex items-center bg-neutral-800 rounded-lg px-3 py-2 shadow-inner">
              <Search className="w-4 h-4 text-neutral-400 mr-2" />
              <input
                type="text"
                placeholder="Search..."
                className="bg-transparent w-full text-sm text-white focus:outline-none"
                onChange={handleSearch}
              />
            </div>
          </div>

          {/* User List */}
          <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-neutral-700">
            {searchQueryMatchUser.length > 0
              ? searchQueryMatchUser.map((user) => (
                <div
                  key={user._id || user.id}
                  onClick={() => setSelectedUser(user)}
                  className={`flex items-center gap-3 p-3 cursor-pointer transition ${selectedUser?.id === user._id
                    ? "bg-purple-800/60"
                    : "hover:bg-neutral-800/60"
                    }`}
                >
                  <img
                    src={user.avatarUrl || `https://ui-avatars.com/api/?name=${user.name}`}
                    alt={user.name}
                    className="w-10 h-10 rounded-full object-cover border-2 border-purple-700"
                  />
                  <div className="flex-1">
                    <p className="font-medium">{user.name}</p>
                    <p className="text-sm text-neutral-400 truncate">{user.email}</p>
                  </div>
                </div>
              ))
              : recentMassgesContacts?.map((msg) => {
                const otherUser = msg?.from?._id === user?._id ? msg?.to : msg?.from;
                if (!otherUser) return null;
                return (
                  <div
                    key={msg._id}
                    onClick={() => setSelectedUser(otherUser)}
                    className={`flex items-center gap-3 p-3 cursor-pointer transition ${selectedUser?.id === otherUser._id
                      ? "bg-purple-800/60"
                      : "hover:bg-neutral-800/60"
                      }`}
                  >
                    <img
                      src={otherUser.avatarUrl || `https://ui-avatars.com/api/?name=${otherUser.name}`}
                      alt={otherUser.name}
                      className="w-10 h-10 rounded-full object-cover border-2 border-purple-700"
                    />
                    <div className="flex-1">
                      <p className="font-medium">{otherUser.name}</p>
                      <p className="text-sm text-neutral-400 truncate">{msg.content}</p>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* Chat Section */}
      {selectedUser && (selectedUser.id || selectedUser._id) ? (
        <div className="flex-1 flex flex-col bg-gradient-to-br from-neutral-900 via-black to-purple-900">
          {/* Mobile back button */}
          <div className="flex md:hidden items-center gap-3 p-3 border-b border-neutral-800 bg-neutral-900">
            <button onClick={() => setSelectedUser(null)} className="p-2 rounded-full hover:bg-neutral-800 transition">
              <ArrowLeft className="text-neutral-400" />
            </button>
            <p className="font-semibold text-purple-300">{selectedUser.name}</p>
          </div>

          {/* Chat Header */}
          <div className="hidden md:flex items-center justify-between p-4 border-b border-neutral-800 bg-gradient-to-r from-purple-800 to-neutral-900 shadow">
            <div className="flex items-center gap-3">
              <img
                src={selectedUser.avatar || `https://ui-avatars.com/api/?name=${selectedUser.name}`}
                alt={selectedUser.name}
                className="w-10 h-10 rounded-full object-cover border-2 border-purple-700"
              />
              <div>
                <p className="font-medium text-lg">{selectedUser.name}</p>
                <p className="text-xs text-neutral-400">
                  {onlineUsers.has(selectedUser.id || selectedUser._id)
                    ? "🟢 Online"
                    : "🔴 Offline"}
                </p>
              </div>
            </div>
            <MoreVertical className="text-neutral-400" />
          </div>

          {/* Messages */}
          <div
            className="flex-1 p-3 sm:p-6 overflow-y-auto flex flex-col space-y-3 no-scrollbar"
            onScroll={handleScroll}
            ref={chatRef}
          >
            {fillteredMessages && fillteredMessages.map((msg, index) => {
              const isSentByUser = msg?.from === user?._id;
              return (
                <div
                  key={msg.id || msg._id || index}
                  className={`flex ${isSentByUser ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`px-4 py-2 rounded-2xl max-w-xs sm:max-w-md shadow-md ${isSentByUser
                      ? "bg-gradient-to-br from-purple-700 to-purple-500 text-white rounded-br-none"
                      : "bg-neutral-800 text-white rounded-bl-none"
                      }`}
                  >
                    {msg.content}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Input */}
          <div className="p-3 sm:p-4 flex items-center gap-2 sm:gap-3 border-t border-neutral-800 bg-neutral-900 sticky bottom-0">
            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 bg-neutral-800 text-white px-4 py-2 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <button
              type="submit"
              className="bg-gradient-to-br from-purple-700 to-purple-500 hover:from-purple-800 hover:to-purple-600 p-3 rounded-full transition shadow"
              onClick={handleSend}
            >
              <Send className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>
      ) : (
        !showSidebar && (
          <div className="flex-1 flex flex-col items-center justify-center bg-gradient-to-br from-neutral-900 via-black to-purple-900">
            <div className="text-center space-y-6">
              <div className="flex flex-col items-center">
                <span className="text-5xl font-extrabold text-purple-400 drop-shadow-lg">💬</span>
                <h1 className="text-2xl sm:text-4xl font-bold mt-4 text-purple-200">
                  Welcome to <span className="text-purple-400">ChatHive</span>
                </h1>
              </div>
              <p className="text-lg text-neutral-300 max-w-md mx-auto">
                Connect, chat, and collaborate in real-time.<br />
                Select a contact or search for users to start chatting!
              </p>
              <div className="flex justify-center">
                <span className="inline-block bg-purple-700/80 text-white px-6 py-2 rounded-full font-semibold shadow-lg">
                  Start your conversation now 🚀
                </span>
              </div>
            </div>
          </div>
        )
      )}
    </div>
  );
}
