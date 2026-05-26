import { useEffect, useRef,useState } from "react";
import InputBar from "./InputBar";
import Message from "./Message";
import { useDmStore } from "../../store/useDmStore";
import { IoIosCloseCircleOutline } from "react-icons/io";
import { FiPhone, FiVideo } from "react-icons/fi";
import axios from "axios";
import { socket } from "../../socket";
import { optimizeAvatar } from "../../utils/optimizeAvatar";

const OpenDm = ({ peerConnectionRef }) => {
  const activeDm = useDmStore((state) => state.activeDm);
  const setActiveDm = useDmStore((state) => state.setActiveDm);
  const messages = useDmStore((state) => state.messages);
  const setMessages = useDmStore((state) => state.setMessages);
  const onlineUsers = useDmStore((state) => state.onlineUsers);
  const currentUser = useDmStore((state) => state.currentUser);
  
  const setCallState = useDmStore((state) => state.setCallState);
  const setCallType = useDmStore((state) => state.setCallType);
  const setCallPeer = useDmStore((state) => state.setCallPeer);
  const setLocalStream = useDmStore((state) => state.setLocalStream);

  const [loading, setLoading] = useState(true);

  const bottomRef = useRef(null);

  const ensureSocketConnected = async () => {
    if (socket.connected) return;

    await new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        cleanup();
        reject(new Error("Socket connection timed out"));
      }, 4000);

      const cleanup = () => {
        clearTimeout(timer);
        socket.off("connect", onConnect);
        socket.off("connect_error", onConnectError);
      };

      const onConnect = () => {
        cleanup();
        resolve();
      };

      const onConnectError = (err) => {
        cleanup();
        reject(err || new Error("Socket connect_error"));
      };

      socket.once("connect", onConnect);
      socket.once("connect_error", onConnectError);

      socket.connect();
    });
  };

  const startCall = async (type = "video") => {
    if (!activeDm?._id) return;
    try {
      // FORCE CLEANUP existing stream tracks to prevent hardware lockout delays
      const existingStream = useDmStore.getState().localStream;
      if (existingStream) {
        existingStream.getTracks().forEach((track) => track.stop());
      }
      if (peerConnectionRef.current) {
        try {
          peerConnectionRef.current.close();
        } catch (e) {}
        peerConnectionRef.current = null;
      }

      // Immediately set call state so UI shows "Calling..."
      setCallState("outgoing");
      setCallType(type);
      setCallPeer(activeDm);

      // Get local stream (will trigger mic/cam permissions)
      const stream = await navigator.mediaDevices.getUserMedia({
        video: type === "video",
        audio: true
      });
      setLocalStream(stream);

      // Initialize peer connection with multiple STUN servers for reliable NAT traversal
      const pc = new RTCPeerConnection({
        iceServers: [
          { urls: "stun:stun.l.google.com:19302" },
          { urls: "stun:stun1.l.google.com:19302" },
          { urls: "stun:stun2.l.google.com:19302" },
          { urls: "stun:stun3.l.google.com:19302" }
        ],
        iceCandidatePoolSize: 10
      });
      peerConnectionRef.current = pc;

      // Add local tracks
      stream.getTracks().forEach((track) => {
        pc.addTrack(track, stream);
      });

      // Handle remote tracks
      pc.ontrack = (event) => {
        if (event.streams && event.streams[0]) {
          useDmStore.getState().setRemoteStream(event.streams[0]);
        }
      };

      // Handle ICE Candidates
      pc.onicecandidate = (event) => {
        if (event.candidate) {
          socket.emit("ice-candidate", {
            to: activeDm._id,
            candidate: event.candidate
          });
        }
      };

      // Monitor connection state — auto-cleanup on failure
      pc.oniceconnectionstatechange = () => {
        console.log("ICE connection state (caller):", pc.iceConnectionState);
        if (pc.iceConnectionState === "failed" || pc.iceConnectionState === "disconnected") {
          console.warn("ICE connection failed/disconnected, ending call");
          // Give disconnected state a few seconds to recover before killing
          if (pc.iceConnectionState === "failed") {
            socket.emit("end-call", { to: activeDm._id });
            useDmStore.getState().resetCall();
          }
        }
      };

      // Create WebRTC Offer
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      // Ensure socket connected so backend receives `call-user`.
      await ensureSocketConnected();

      // Emit to socket signaling channel
      let acked = false;
      const ackTimeout = setTimeout(() => {
        if (acked) return;
        alert("Call start not delivered to server (no ack). Try again.");
        useDmStore.getState().resetCall();
      }, 3000);

      socket.emit(
        "call-user",
        {
          to: activeDm._id,
          offer,
          callType: type,
          callerInfo: {
            username: currentUser?.username,
            avatarUrl: currentUser?.avatarUrl,
            _id: currentUser?._id
          }
        },
        (ack) => {
          acked = true;
          clearTimeout(ackTimeout);
          console.log("call-user ack:", ack);
          if (!ack?.ok) {
            alert(`Call start failed: ${ack?.error || "unknown error"}`);
            useDmStore.getState().resetCall();
          }
        }
      );

    } catch (error) {
      console.error("Failed to start call:", error);
      const msg =
        error?.name === "NotAllowedError"
          ? "Microphone/camera permission denied. Please allow access in your browser settings."
          : error?.name === "NotFoundError"
            ? "No microphone/camera found. Check device permissions and hardware."
            : error?.message
              ? error.message
              : "Failed to start call.";
      alert(msg);
      // Reset call state
      useDmStore.getState().resetCall();
    }
  };

  useEffect(() => {
  if (!activeDm?.channelId) {
    setMessages([]);
    return;
  }


  const fetchMessages = async () => {
    try {
      setLoading(true);

      const url = import.meta.env.VITE_BACKEND_URL;

      const res = await axios.get(
        `${url}/message/${activeDm.channelId}`,
        { withCredentials: true }
      );

      const data = res.data?.data || res.data || [];
      setMessages(Array.isArray(data) ? data : []);

    } catch (error) {
      console.error("Fetch messages error:", error);
    } finally {
      setLoading(false);
    }

    // Clear notifications in the backend since user just viewed the channel
    try {
      const url = import.meta.env.VITE_BACKEND_URL;
      await axios.delete(`${url}/channel/notifications/${activeDm.channelId}`, { withCredentials: true });
    } catch (err) {
      console.error("Failed to clear notifications:", err);
    }
  };

  fetchMessages();
  
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
  bottomRef.current?.scrollIntoView({ behavior: "auto" });
}, [messages]);

  if (!activeDm) return null;

  return (
    <div className="h-full w-full flex justify-center items-center text-white">

      {/* FLAT CHAT CONTAINER */}
      <div className="w-full h-full flex flex-col bg-transparent">

        {/* HEADER */}
        <div
          className="flex items-center justify-between px-6 py-4
          border-b border-white/[0.05]
          bg-white/[0.02]"
        >

          <div className="flex items-center gap-4">

            <div className="relative">
              <img
                src={optimizeAvatar(activeDm.avatarUrl)}
                alt={activeDm.username}
                className={`h-10 w-10 rounded-full object-cover transition duration-300 ${!onlineUsers[activeDm._id] && 'opacity-60 grayscale-[50%]'}`}
              />
              {onlineUsers[activeDm._id] && (
                <span className="absolute bottom-0 right-0 h-3 w-3 bg-green-400 rounded-full border border-black"></span>
              )}
            </div>

            <div>
              <h1 className="font-semibold text-lg tracking-wide">
                {activeDm.username}
              </h1>
              {onlineUsers[activeDm._id] ? (
                 <p className="text-xs text-green-400">online</p>
              ) : (
                 <p className="text-xs text-gray-500">offline</p>
              )}
            </div>

          </div>

          <div className="flex items-center gap-4">
            {/* Audio Call Button */}
            <button
              onClick={() => startCall("audio")}
              disabled={!onlineUsers[activeDm._id]}
              className={`p-2.5 rounded-full bg-white/5 border border-white/10 text-zinc-300 hover:text-white hover:bg-indigo-500/20 hover:border-indigo-500/30 transition-all duration-300 cursor-pointer ${
                !onlineUsers[activeDm._id] && "opacity-40 cursor-not-allowed hover:bg-white/5 hover:border-white/10 text-zinc-500"
              }`}
              title={onlineUsers[activeDm._id] ? "Start Audio Call" : "User is offline"}
            >
              <FiPhone size={18} />
            </button>

            {/* Video Call Button */}
            <button
              onClick={() => startCall("video")}
              disabled={!onlineUsers[activeDm._id]}
              className={`p-2.5 rounded-full bg-white/5 border border-white/10 text-zinc-300 hover:text-white hover:bg-indigo-500/20 hover:border-indigo-500/30 transition-all duration-300 cursor-pointer ${
                !onlineUsers[activeDm._id] && "opacity-40 cursor-not-allowed hover:bg-white/5 hover:border-white/10 text-zinc-500"
              }`}
              title={onlineUsers[activeDm._id] ? "Start Video Call" : "User is offline"}
            >
              <FiVideo size={18} />
            </button>

            <IoIosCloseCircleOutline
              size={28}
              className="cursor-pointer text-zinc-500 hover:text-red-400 transition ml-2"
              onClick={() => {
                socket.emit("leave_channel", {
                  channelId: activeDm.channelId
                });
                setActiveDm(null);
                setMessages([]);
              }}
            />
          </div>

        </div>

        {/* MESSAGES */}
        <div className="flex-1 overflow-y-auto px-8 py-6 space-y-4 bg-transparent">

          {loading ? (
  <div className="flex items-center justify-center h-full text-gray-400">
    Loading messages...
  </div>
) : messages.length === 0 ? (
  <div className="h-full flex flex-col justify-center items-center text-gray-300">

    <div className="text-5xl mb-4 opacity-60">
      💬
    </div>

    <p className="text-lg">No messages yet</p>
    <p className="text-sm mt-1 text-gray-400">
      Start the conversation
    </p>

  </div>
) : (
  messages.map((item) => (
    <Message key={item._id} message={item} />
  ))
)}
          <div ref={bottomRef} />

        </div>

        {/* INPUT */}
        <div className="px-6 py-4 mt-auto">
          <div className="bg-white/[0.03] backdrop-blur-md rounded-2xl p-1 border border-white/[0.05] focus-within:border-white/20 focus-within:bg-white/[0.05] transition-all duration-300">
            <InputBar />
          </div>
        </div>

      </div>

    </div>
  );
};

export default OpenDm;

