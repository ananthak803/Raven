import React, { useRef, useEffect } from "react";
import { useDmStore } from "../../store/useDmStore";
import { socket } from "../../socket";
import { optimizeAvatar } from "../../utils/optimizeAvatar";
import {
  FiPhone,
  FiPhoneOff,
  FiVideo,
  FiVideoOff,
  FiMic,
  FiMicOff,
  FiMinimize2,
  FiMaximize2,
  FiVolume2
} from "react-icons/fi";

const CallOverlay = ({ peerConnectionRef, iceCandidateBuffer }) => {
  const {
    callState,
    callType,
    callPeer,
    incomingCallOffer,
    localStream,
    remoteStream,
    isMuted,
    isCamOff,
    isMinimized,
    callDuration,
    setIsMuted,
    setIsCamOff,
    setIsMinimized,
    setCallDuration,
    resetCall,
    setCallState,
    setLocalStream,
    setRemoteStream
  } = useDmStore();

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const remoteAudioRef = useRef(null);

  const ensureSocketConnected = async () => {
    if (socket.connected) return;

    await new Promise((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error("Socket connection timed out")), 4000);

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

  // Active call duration timer
  useEffect(() => {
    let interval = null;
    if (callState === "active") {
      interval = setInterval(() => {
        setCallDuration(useDmStore.getState().callDuration + 1);
      }, 1000);
    } else {
      setCallDuration(0);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [callState]);

  // Listen to remote peer track muting events to dynamically toggle display fallback UI
  const [remoteVideoMuted, setRemoteVideoMuted] = React.useState(false);

  useEffect(() => {
    if (remoteStream && callType === "video") {
      const handleTrackMuted = () => setRemoteVideoMuted(true);
      const handleTrackUnmuted = () => setRemoteVideoMuted(false);

      const videoTrack = remoteStream.getVideoTracks()[0];
      if (videoTrack) {
        // Init state
        setRemoteVideoMuted(!videoTrack.enabled || videoTrack.muted);
        videoTrack.addEventListener("mute", handleTrackMuted);
        videoTrack.addEventListener("unmute", handleTrackUnmuted);
        
        return () => {
          videoTrack.removeEventListener("mute", handleTrackMuted);
          videoTrack.removeEventListener("unmute", handleTrackUnmuted);
        };
      }
    } else {
      setRemoteVideoMuted(false);
    }
  }, [remoteStream, callState, callType]);

  // Format seconds into MM:SS
  const formatTime = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, "0");
    const s = (secs % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  // Sync streams to media players
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream, callState, isMinimized, isCamOff]);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream && callType === "video") {
      remoteVideoRef.current.srcObject = remoteStream;
    }
    if (remoteAudioRef.current && remoteStream) {
      remoteAudioRef.current.srcObject = remoteStream;
    }
  }, [remoteStream, callState, callType, isMinimized, remoteVideoMuted]);

  // Clean up streams on call reset/end
  const stopAllTracks = () => {
    if (localStream) {
      localStream.getTracks().forEach((track) => track.stop());
    }
    setLocalStream(null);
    setRemoteStream(null);
  };

  const handleEndCall = () => {
    if (callPeer?._id) {
      socket.emit("end-call", { to: callPeer._id });
    }
    if (peerConnectionRef.current) {
      try {
        peerConnectionRef.current.close();
      } catch (e) {
        console.error("Error closing PC", e);
      }
      peerConnectionRef.current = null;
    }
    stopAllTracks();
    resetCall();
  };

  const handleDeclineCall = () => {
    if (callPeer?._id) {
      socket.emit("reject-call", { to: callPeer._id });
    }
    resetCall();
  };

  const handleAcceptCall = async (acceptType = "video") => {
    try {
      const type = acceptType || callType;
      // Get local stream (Always request both audio and video tracks if video call, or just audio for voice call)
      const stream = await navigator.mediaDevices.getUserMedia({
        video: type === "video",
        audio: true
      });
      setLocalStream(stream);

      // Use multiple STUN servers for reliable NAT traversal (match caller config)
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

      // Add local tracks to peer connection
      stream.getTracks().forEach((track) => {
        pc.addTrack(track, stream);
      });

      // Handle incoming remote tracks
      pc.ontrack = (event) => {
        if (event.streams && event.streams[0]) {
          setRemoteStream(event.streams[0]);
        }
      };

      // Handle ICE Candidates
      pc.onicecandidate = (event) => {
        if (event.candidate && callPeer?._id) {
          socket.emit("ice-candidate", {
            to: callPeer._id,
            candidate: event.candidate
          });
        }
      };

      // Monitor connection state — auto-cleanup on failure
      pc.oniceconnectionstatechange = () => {
        console.log("ICE connection state (callee):", pc.iceConnectionState);
        if (pc.iceConnectionState === "failed") {
          console.warn("ICE connection failed on callee side, ending call");
          handleEndCall();
        }
      };

      // Set Remote Description (offer) with safety catch
      if (incomingCallOffer) {
        // FIX: Use modern RTCSessionDescription API (no constructor wrapper)
        await pc.setRemoteDescription(incomingCallOffer);

        // CRITICAL: Flush any ICE candidates that were buffered while waiting for PC creation
        if (iceCandidateBuffer?.current) {
          const buffered = [...iceCandidateBuffer.current];
          iceCandidateBuffer.current = [];
          for (const candidate of buffered) {
            try {
              await pc.addIceCandidate(new RTCIceCandidate(candidate));
            } catch (err) {
              console.warn("Error flushing buffered ICE candidate (callee):", err);
            }
          }
          if (buffered.length > 0) {
            console.log(`Callee flushed ${buffered.length} buffered ICE candidates`);
          }
        }

        // Create & Set Answer
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);

        // Ensure socket connected so backend receives `make-answer`.
        await ensureSocketConnected();

        // Send answer back to the caller
        let acked = false;
        const ackTimeout = setTimeout(() => {
          if (acked) return;
          alert("Answer not delivered to server (no ack). Try again.");
          handleEndCall();
        }, 3000);

        socket.emit(
          "make-answer",
          {
            to: callPeer._id,
            answer
          },
          (ack) => {
            acked = true;
            clearTimeout(ackTimeout);
            console.log("make-answer ack:", ack);
            if (!ack?.ok) {
              alert(`Answer failed: ${ack?.error || "unknown error"}`);
              handleEndCall();
            }
          }
        );
      }

      setCallState("active");

    } catch (error) {
      console.error("Error accepting call:", error);
      handleEndCall();
    }
  };

  const toggleMute = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
      }
    }
  };

  const toggleCamera = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsCamOff(!videoTrack.enabled);
        
        // Notify remote peer through socket layer
        if (callPeer?._id) {
          socket.emit("ice-candidate", {
            to: callPeer._id,
            candidate: null // Send metadata candidate null as standard refresh trigger
          });
        }
      }
    }
  };

  if (callState === "idle") return null;

  // --- MINIMIZED CALL STATE ---
  if (isMinimized && callState === "active") {
    return (
      // Only keep hidden audio router tag for stream active playback
      <audio ref={remoteAudioRef} autoPlay playsInline />
    );
  }

  // --- FULL SCREEN MODAL VIEW ---
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/90 backdrop-blur-xl p-4 md:p-6 transition-all duration-300">
      {/* Invisible HTML5 Audio component to play received audio stream */}
      <audio ref={remoteAudioRef} autoPlay playsInline />

      <div className="w-full max-w-4xl h-[85vh] max-h-[700px] bg-[#0d0d12] border border-zinc-800 shadow-[0_24px_64px_rgba(0,0,0,0.8)] rounded-3xl overflow-hidden flex flex-col relative">
        
        {/* Calling Overlay Headers */}
        <div className="absolute top-6 left-6 z-20 flex items-center gap-3">
          <div className="bg-zinc-800 px-3 py-1 rounded-full text-xs font-semibold text-zinc-300 tracking-widest uppercase border border-zinc-700">
            {callType === "video" ? "Video Call" : "Voice Call"}
          </div>
          {callState === "active" && (
            <div className="bg-zinc-900/80 px-3 py-1 rounded-full text-xs font-mono text-zinc-400 border border-zinc-800">
              {formatTime(callDuration)}
            </div>
          )}
        </div>

        {/* Minimize Button */}
        {callState === "active" && (
          <button
            onClick={() => setIsMinimized(true)}
            className="absolute top-6 right-6 z-20 p-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-full border border-zinc-700 backdrop-blur-md transition-all active:scale-95 cursor-pointer"
            title="Minimize Call Screen"
          >
            <FiMinimize2 size={18} />
          </button>
        )}

        {/* 1. OUTGOING CALL STATE */}
        {callState === "outgoing" && (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-[#0d0d12]">
            <div className="relative mb-8">
              <img
                src={optimizeAvatar(callPeer?.avatarUrl)}
                alt={callPeer?.username}
                className="h-28 w-28 rounded-full border border-zinc-700 object-cover relative z-10"
              />
            </div>
            <h2 className="text-xl font-medium text-zinc-200 mb-2">{callPeer?.username}</h2>
            <p className="text-zinc-500 text-xs tracking-widest uppercase mb-16">Calling...</p>

            <button
              onClick={handleEndCall}
              className="p-5 bg-red-600 hover:bg-red-700 active:scale-95 transition-all text-white rounded-full cursor-pointer shadow-lg"
            >
              <FiPhoneOff size={28} />
            </button>
          </div>
        )}

        {/* 2. INCOMING CALL STATE */}
        {callState === "incoming" && (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-[#0d0d12]">
            <div className="relative mb-8">
              <img
                src={optimizeAvatar(callPeer?.avatarUrl)}
                alt={callPeer?.username}
                className="h-28 w-28 rounded-full border border-zinc-700 object-cover relative z-10"
              />
            </div>
            <h2 className="text-xl font-medium text-zinc-200 mb-2">{callPeer?.username}</h2>
            <p className="text-zinc-400 text-xs tracking-widest uppercase mb-16">Incoming Call...</p>

            <div className="flex gap-8">
              <button
                onClick={handleDeclineCall}
                className="p-5 bg-red-600 hover:bg-red-700 active:scale-95 transition-all text-white rounded-full cursor-pointer shadow-lg"
              >
                <FiPhoneOff size={28} />
              </button>
              <button
                onClick={() => handleAcceptCall(callType)}
                className="p-5 bg-zinc-700 hover:bg-zinc-600 active:scale-95 transition-all text-white rounded-full cursor-pointer shadow-lg"
              >
                {callType === "video" ? <FiVideo size={28} /> : <FiPhone size={28} />}
              </button>
            </div>
          </div>
        )}

        {/* 3. ACTIVE CALL STATE */}
        {callState === "active" && (
          <div className="flex-1 flex flex-col relative bg-zinc-950 overflow-hidden">
            
            {callType === "video" ? (
              <div className="flex-1 w-full h-full relative">
                {/* Remote Video (Fullscreen) or profile picture fallback if remote camera is disabled */}
                {remoteStream && !remoteVideoMuted ? (
                  <video
                    ref={remoteVideoRef}
                    autoPlay
                    playsInline
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-[#0d0d12] text-zinc-500">
                    <div className="flex flex-col items-center gap-4">
                      <img
                        src={optimizeAvatar(callPeer?.avatarUrl)}
                        alt={callPeer?.username}
                        className="h-32 w-32 rounded-full border border-zinc-800 object-cover"
                      />
                      <span className="text-xs uppercase tracking-wider text-zinc-400">
                        {callPeer?.username}'s Camera is turned off
                      </span>
                    </div>
                  </div>
                )}

                {/* Local Video Stream or local profile picture fallback if local camera is disabled */}
                <div className="absolute bottom-6 right-6 w-36 h-48 md:w-44 md:h-60 bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl z-20 backdrop-blur-md flex items-center justify-center">
                  {isCamOff ? (
                    <div className="w-full h-full flex flex-col items-center justify-center p-4 gap-2 bg-[#0d0d12]">
                      <img
                        src={optimizeAvatar(useDmStore.getState().currentUser?.avatarUrl)}
                        alt="Local Avatar"
                        className="h-16 w-16 rounded-full border border-zinc-700 object-cover"
                      />
                      <span className="text-[10px] uppercase text-zinc-500">Camera Off</span>
                    </div>
                  ) : (
                    <video
                      ref={localVideoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover transform -scale-x-100"
                    />
                  )}
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-8 bg-[#0d0d12]">
                <div className="relative mb-6">
                  <img
                    src={optimizeAvatar(callPeer?.avatarUrl)}
                    alt={callPeer?.username}
                    className="h-32 w-32 rounded-full border border-zinc-800 object-cover"
                  />
                </div>
                <h3 className="text-xl font-medium text-zinc-200 mb-2">{callPeer?.username}</h3>
                <div className="text-zinc-500 text-xs font-semibold tracking-wider uppercase">
                  Connected
                </div>
              </div>
            )}

            {/* Controls Bar */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-zinc-900/90 border border-zinc-800 backdrop-blur-xl px-6 py-3 rounded-full shadow-2xl z-30">
              <button
                onClick={toggleMute}
                className={`p-3.5 rounded-full transition-all duration-300 cursor-pointer ${
                  isMuted
                    ? "bg-red-600 text-white shadow-md"
                    : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white"
                }`}
                title={isMuted ? "Unmute Microphone" : "Mute Microphone"}
              >
                {isMuted ? <FiMicOff size={20} /> : <FiMic size={20} />}
              </button>

              {callType === "video" && (
                <button
                  onClick={toggleCamera}
                  className={`p-3.5 rounded-full transition-all duration-300 cursor-pointer ${
                    isCamOff
                      ? "bg-red-600 text-white shadow-md"
                      : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white"
                  }`}
                  title={isCamOff ? "Turn Camera On" : "Turn Camera Off"}
                >
                  {isCamOff ? <FiVideoOff size={20} /> : <FiVideo size={20} />}
                </button>
              )}

              <button
                onClick={handleEndCall}
                className="p-3.5 bg-red-600 hover:bg-red-700 active:scale-95 transition-all text-white rounded-full cursor-pointer shadow-md"
                title="Hang Up"
              >
                <FiPhoneOff size={20} />
              </button>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};

export default CallOverlay;
