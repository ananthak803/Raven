import { useEffect, useRef } from "react";
import DmListSection from "./DmListSection";
import OpenDm from "./OpenDm";
import { useDmStore } from "../../store/useDmStore";
import FriendSection from "./FriendSection";
import axios from "axios";
import { socket } from "../../socket";
import Particles from "../animated/ParticleSpread";


const DmSection = ({ peerConnectionRef }) => {
  const activeDm = useDmStore((state) => state.activeDm);
  const setDms = useDmStore((state) => state.setDms);
  const currentUser = useDmStore((state) => state.currentUser);
  const setUserOnlineStatus = useDmStore((state) => state.setUserOnlineStatus);

  const getDms = async () => {
    const url = import.meta.env.VITE_BACKEND_URL;
    const res = await axios.get(`${url}/channel/dms`, {
      withCredentials: true,
    });
    return res.data;
  };

  useEffect(() => {
    const handleUserOnline = (userId) => setUserOnlineStatus(userId, true);
    const handleUserOffline = (userId) => setUserOnlineStatus(userId, false);

    socket.on("user_online", handleUserOnline);
    socket.on("user_offline", handleUserOffline);

    return () => {
      socket.off("user_online", handleUserOnline);
      socket.off("user_offline", handleUserOffline);
    };
  }, []);

  useEffect(() => {
    if (!currentUser) return;
    const fetchDms = async () => {
      try {
        const dms = await getDms();
        setDms(dms);
      } catch (err) {
        console.error("Failed to fetch DMs", err);
      }
    };

    fetchDms();
  }, [currentUser]);
  useEffect(() => {
    const handleFriendAccepted = async () => {
      try {
        const dms = await getDms();
        setDms(dms);
      } catch (err) {
        console.error("Failed to fetch DMs", err);
      }
    };

    socket.on("friendAccepted", handleFriendAccepted);

    return () => {
      socket.off("friendAccepted", handleFriendAccepted);
    };
  }, []);

  return (
    <div className="w-screen h-screen relative bg-[#030305] text-zinc-300 font-sans tracking-wide overflow-hidden">

      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white/[0.03] via-[#030305] to-[#030305] z-0"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,_var(--tw-gradient-stops))] from-zinc-900/40 via-transparent to-transparent z-0"></div>

      <div className="absolute inset-0 z-0 opacity-30">
        <Particles
          particleColors={["#ffffff", "#e4e4e7", "#a1a1aa"]}
          particleCount={200}
          particleSpread={25}
          speed={0.08}
          particleBaseSize={80}
          moveParticlesOnHover
          alphaParticles={true}
          disableRotation={false}
          pixelRatio={1}
        />
      </div>

      <div className="relative z-10 flex h-full p-4 gap-4 xl:p-6 xl:gap-6">

        <div className="
          w-[340px] h-full
          bg-white/[0.015]
          backdrop-blur-2xl
          border-y border-x border-white/[0.05]
          border-t-white/[0.1]
          rounded-3xl
          shadow-[0_8px_32px_0_rgba(0,0,0,0.36)]
          flex flex-col
          overflow-hidden
        ">
          <DmListSection />
        </div>

        <div className="
          flex-1 h-full
          bg-white/[0.015]
          backdrop-blur-2xl
          border-y border-x border-white/[0.05]
          border-t-white/[0.1]
          rounded-3xl
          shadow-[0_8px_32px_0_rgba(0,0,0,0.36)]
          flex flex-col
          overflow-hidden
        ">
          {activeDm ? (
            <OpenDm item={activeDm} peerConnectionRef={peerConnectionRef} />
          ) : (
            <div className="flex items-center justify-center h-full text-zinc-500/50 mix-blend-screen">
              <FriendSection />
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default DmSection;
