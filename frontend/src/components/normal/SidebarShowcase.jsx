import ravenWhite from "../../assets/raven_white.png";
import { RiMessage2Fill } from "react-icons/ri";
import { MdGroups2 } from "react-icons/md";
import { IoIosSettings } from "react-icons/io";
import { useDmStore } from "../../store/useDmStore";
import { optimizeAvatar } from "../../utils/optimizeAvatar";
import { socket } from "../../socket";
import { FiMic, FiMicOff, FiVideo, FiVideoOff, FiPhoneOff } from "react-icons/fi";

const SidebarShowcase = ({ activeItem, setActiveItem }) => {
  const dms = useDmStore((state) => state.dms);
  const totalUnreadSum = dms.reduce((acc, dm) => acc + (dm.unread || 0), 0);

  return (
    <div className="flex h-screen bg-gray-300 border-r border-gray-700">
      <div className="flex flex-col items-center w-18 h-full bg-[#000000] text-gray-400">
        <img
          src={ravenWhite}
          className="h-14 mt-3 mb-2 cursor-pointer"
          onClick={() => setActiveItem("")}
        />

        <div className="flex flex-col items-center mt-2">
          <div className="relative">
            <SidebarIcon
              active={activeItem === "dm"}
              onClick={() => setActiveItem("dm")}
            >
              <RiMessage2Fill size={25} />
            </SidebarIcon>

            {totalUnreadSum > 0 && (
              <span className="absolute top-1 right-0 flex h-3 w-3">
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500 border border-black"></span>
              </span>
            )}
          </div>

          {/* <SidebarIcon
            active={activeItem === "group"}
            onClick={() => setActiveItem("group")}
          >
            <MdGroups2 size={25} />
          </SidebarIcon> */}

          <SidebarIcon
            active={activeItem === "setting"}
            onClick={() => setActiveItem("setting")}
          >
            <IoIosSettings size={25} />
          </SidebarIcon>
        </div>

        {/* Dynamic Vertical Minimized Call Widget in Sidebar */}
        {useDmStore.getState().callState === "active" &&
          useDmStore.getState().isMinimized && (
            <div className="mt-auto mb-6 flex flex-col items-center gap-3 bg-[#0d0d12] border border-zinc-800 p-2 rounded-2xl w-14">
              <div
                className="relative cursor-pointer"
                onClick={() =>
                  useDmStore.getState().setIsMinimized(false)
                }
                title="Expand Call View"
              >
                <img
                  src={optimizeAvatar(useDmStore.getState().callPeer?.avatarUrl)}
                  alt={useDmStore.getState().callPeer?.username}
                  className="h-10 w-10 rounded-full border border-zinc-700 object-cover"
                />
              </div>

              {/* Call duration timer */}
              <div className="text-[10px] font-mono text-zinc-400">
                {Math.floor(useDmStore.getState().callDuration / 60)
                  .toString()
                  .padStart(2, "0")}
                :
                {(useDmStore.getState().callDuration % 60)
                  .toString()
                  .padStart(2, "0")}
              </div>

              <div className="flex flex-col gap-2 w-full items-center">
                <button
                  onClick={() => {
                    const stream = useDmStore.getState().localStream;
                    if (stream) {
                      const audioTrack = stream.getAudioTracks()[0];
                      if (audioTrack) {
                        audioTrack.enabled = !audioTrack.enabled;
                        useDmStore
                          .getState()
                          .setIsMuted(!audioTrack.enabled);
                      }
                    }
                  }}
                  className={`p-2 rounded-xl transition cursor-pointer ${
                    useDmStore.getState().isMuted
                      ? "bg-red-600 text-white"
                      : "bg-zinc-800 text-zinc-400 hover:text-white"
                  }`}
                  title={
                    useDmStore.getState().isMuted ? "Unmute Mic" : "Mute Mic"
                  }
                >
                  {useDmStore.getState().isMuted ? (
                    <FiMicOff size={12} />
                  ) : (
                    <FiMic size={12} />
                  )}
                </button>

                {useDmStore.getState().callType === "video" && (
                  <button
                    onClick={() => {
                      const stream = useDmStore.getState().localStream;
                      if (stream) {
                        const videoTrack = stream.getVideoTracks()[0];
                        if (videoTrack) {
                          videoTrack.enabled = !videoTrack.enabled;
                          useDmStore
                            .getState()
                            .setIsCamOff(!videoTrack.enabled);
                        }
                      }
                    }}
                    className={`p-2 rounded-xl transition cursor-pointer ${
                      useDmStore.getState().isCamOff
                        ? "bg-red-600 text-white"
                        : "bg-zinc-800 text-zinc-400 hover:text-white"
                    }`}
                    title={
                      useDmStore.getState().isCamOff
                        ? "Camera On"
                        : "Camera Off"
                    }
                  >
                    {useDmStore.getState().isCamOff ? (
                      <FiVideoOff size={12} />
                    ) : (
                      <FiVideo size={12} />
                    )}
                  </button>
                )}

                <button
                  onClick={() => {
                    const to = useDmStore.getState().callPeer?._id;
                    if (to) socket.emit("end-call", { to });
                    const stream = useDmStore.getState().localStream;
                    if (stream) stream.getTracks().forEach((track) => track.stop());
                    useDmStore.getState().resetCall();
                  }}
                  className="p-2 bg-red-600 hover:bg-red-700 rounded-xl text-white transition mt-1 cursor-pointer"
                  title="Hang Up"
                >
                  <FiPhoneOff size={12} />
                </button>
              </div>
            </div>
          )}
      </div>
    </div>
  );
};

const SidebarIcon = ({ children, active, onClick }) => {
  return (
    <button
      onClick={onClick}
      className={`flex items-center justify-center w-12 h-12 mt-2 rounded-2xl transition-all duration-200
        ${active
          ? "bg-gray-800 text-white"
          : "hover:bg-gray-700 hover:text-gray-300"
        } border-1 `}
    >
      {children}
    </button>
  );
};

export default SidebarShowcase;

