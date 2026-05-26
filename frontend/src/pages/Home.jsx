import React, { useState, useEffect, useRef } from "react";
import SidebarShowcase from "../components/normal/SidebarShowcase";
import SectionContainer from "../components/normal/SectionContainer";
import CallOverlay from "../components/normal/CallOverlay";
import { useDmStore } from "../store/useDmStore";
import { socket } from "../socket";

const Home = () => {
  const [activeItem, setActiveItem] = useState("");
  const peerConnectionRef = useRef(null);
  // Buffer ICE candidates that arrive before remote description is set
  const iceCandidateBuffer = useRef([]);

  const {
    setCallState,
    setCallType,
    setCallPeer,
    setIncomingCallOffer,
    resetCall
  } = useDmStore();

  // Helper: flush all buffered ICE candidates into the peer connection
  const flushIceCandidates = async (pc) => {
    if (!pc) return;
    const buffered = [...iceCandidateBuffer.current];
    iceCandidateBuffer.current = [];
    for (const candidate of buffered) {
      try {
        await pc.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (err) {
        console.warn("Error flushing buffered ICE candidate:", err);
      }
    }
    if (buffered.length > 0) {
      console.log(`Flushed ${buffered.length} buffered ICE candidates`);
    }
  };

  // Socket connection & WebRTC Calling Signalling Listeners
  useEffect(() => {
    const cleanupCall = () => {
      iceCandidateBuffer.current = [];
      if (peerConnectionRef.current) {
        try {
          peerConnectionRef.current.close();
        } catch {
          // Ignore cleanup errors
        }
        peerConnectionRef.current = null;
      }
      const stream = useDmStore.getState().localStream;
      if (stream) {
        stream.getTracks().forEach((track) => {
          track.stop();
          track.enabled = false;
        });
      }
      resetCall();
    };

    // Register listeners before connecting to avoid any race on fast networks.
    const onConnect = () => {
      console.log("Connected:", socket.id);
    };

    const onCallIncoming = ({ from, offer, callType, callerInfo }) => {
      console.log("Received incoming call offer from:", from);
      // Clear any stale buffered candidates from a previous call
      iceCandidateBuffer.current = [];
      setCallState("incoming");
      setCallType(callType);
      setCallPeer(callerInfo);
      setIncomingCallOffer(offer);
    };

    // Handle Answer (caller side — callee accepted)
    const onCallAnswered = async ({ from, answer }) => {
      console.log("Call answered by:", from);
      const pc = peerConnectionRef.current;
      if (!pc) return;
      try {
        await pc.setRemoteDescription(new RTCSessionDescription(answer));
        // NOW flush any ICE candidates that arrived before the answer
        await flushIceCandidates(pc);
        setCallState("active");
      } catch (error) {
        console.error("Error setting remote description for answer:", error);
        socket.emit("end-call", { to: from });
        cleanupCall();
      }
    };

    // Handle incoming ICE candidates
    const onIceCandidate = async ({ candidate }) => {
      if (!candidate) return;
      const pc = peerConnectionRef.current;
      // Only add directly if PC exists AND remote description is already set
      if (pc && pc.remoteDescription && pc.remoteDescription.type) {
        try {
          await pc.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (error) {
          console.warn("Error adding ICE candidate, buffering:", error);
          iceCandidateBuffer.current.push(candidate);
        }
      } else {
        // Buffer it — will be flushed after setRemoteDescription
        iceCandidateBuffer.current.push(candidate);
      }
    };

    const onCallRejected = () => {
      console.log("Call was rejected by the other party.");
      cleanupCall();
    };

    const onCallEnded = () => {
      console.log("Call ended by the other party.");
      cleanupCall();
    };

    socket.on("connect", onConnect);

    socket.on("call-incoming", onCallIncoming);
    socket.on("call-answered", onCallAnswered);
    socket.on("ice-candidate", onIceCandidate);
    socket.on("call-rejected", onCallRejected);
    socket.on("call-ended", onCallEnded);

    // Ensure the socket is connected (React StrictMode may run effects twice).
    if (!socket.connected) {
      socket.connect();
    }

    return () => {
      socket.off("connect", onConnect);
      socket.off("call-incoming", onCallIncoming);
      socket.off("call-answered", onCallAnswered);
      socket.off("ice-candidate", onIceCandidate);
      socket.off("call-rejected", onCallRejected);
      socket.off("call-ended", onCallEnded);
      // Do NOT disconnect the shared singleton socket here.
      // With React StrictMode the effect cleanup can run temporarily,
      // which may cause missed incoming call events.
    };
  }, []);

  return (
    <div className="h-screen w-full flex fixed">
      <SidebarShowcase
        activeItem={activeItem}
        setActiveItem={setActiveItem}
      />
      <SectionContainer active={activeItem} peerConnectionRef={peerConnectionRef} />
      
      {/* Global Call Overlay */}
      <CallOverlay peerConnectionRef={peerConnectionRef} iceCandidateBuffer={iceCandidateBuffer} />
    </div>
  );
};

export default Home;