import { useEffect, useRef } from "react";
import InputBar from "./InputBar";
import Message from "./Message";
import { useDmStore } from "../../store/useDmStore";
import { IoIosCloseCircleOutline } from "react-icons/io";
import axios from "axios";
import { socket } from "../../socket";

const OpenDm = () => {
  const activeDm = useDmStore((state) => state.activeDm);
  const setActiveDm = useDmStore((state) => state.setActiveDm);
  const messages = useDmStore((state) => state.messages);
  const setMessages = useDmStore((state) => state.setMessages);
 const addMessage = useDmStore((state) => state.addMessage);


  const bottomRef = useRef(null);



useEffect(() => {
  const handleConnect = () => {
    console.log("Socket connected");
  };

  const handleDisconnect = () => {
    console.log("Socket disconnected");
  };

  socket.on("connect", handleConnect);
  socket.on("disconnect", handleDisconnect);

  if (socket.connected) {
    console.log("Socket already connected");
  }

  return () => {
    socket.off("connect", handleConnect);
    socket.off("disconnect", handleDisconnect);
  };
}, []);


  useEffect(() => {
    if (!activeDm?.channelId) {
      setMessages([]);
      return;
    }

    const fetchMessages = async () => {
      try {
        const url = import.meta.env.VITE_BACKEND_URL;

        const res = await axios.get(
          `${url}/message/${activeDm.channelId}`,
          { withCredentials: true }
        );

        const data = res.data?.data || res.data || [];
setMessages(Array.isArray(data) ? data : []);

      } catch (error) {
        console.error("Fetch messages error:", error);
      }
    };

    fetchMessages();
  }, [activeDm?.channelId, setMessages]);

  useEffect(() => {
    if (!activeDm?.channelId) return;

    socket.emit("join_channel", {
      channelId: activeDm.channelId,
    });

    return () => {
      socket.emit("leave_channel", {
        channelId: activeDm.channelId,
      });
    };
  }, [activeDm?.channelId]);


useEffect(() => {
  if (!activeDm?.channelId) return;


const handleReceive = (message) => {
  if (message.channelId === activeDm.channelId) {
    addMessage(message);
  }
};


  socket.on("receive_message", handleReceive);

  return () => {
    socket.off("receive_message", handleReceive);
  };
}, [activeDm?.channelId]);




  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (!activeDm) return null;

  return (
    <div className="text-white h-full flex flex-col">

      <div className="flex justify-center items-center border-b border-white/10 h-[7%] relative">
        <img
          src={activeDm.avatarUrl}
          className="h-[70%] rounded-full mx-2"
          alt={activeDm.username}
        />
        <h1>{activeDm.username}</h1>

        <IoIosCloseCircleOutline
          size={25}
          className="absolute right-5 cursor-pointer"
          onClick={() => {
            setActiveDm(null);
            setMessages([]);
          }}
        />
      </div>

      <div className="flex-1 overflow-y-auto flex flex-col px-4 py-3">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500 text-sm">
            <p className="text-lg mb-2">No messages yet</p>
            <p>Start the conversation!</p>
            <p className="mt-1">Say Hi 👋</p>
          </div>
        ) : (
          messages.map((item) => (
            <Message key={item._id} message={item} />
          ))
        )}

        <div ref={bottomRef} />
      </div>

      <div className="h-20 w-full flex justify-center items-center">
        <InputBar />
      </div>
    </div>
  );
};

export default OpenDm;
