import { useEffect } from "react";
import DmListSection from "./DmListSection";
import OpenDm from "./OpenDm";
import { useDmStore } from "../../store/useDmStore";
import FriendSection from "./FriendSection";
import axios from "axios";

const DmSection = () => {
  const activeDm = useDmStore((state) => state.activeDm);
  const setDms = useDmStore((state) => state.setDms);
  const currentUser = useDmStore((state) => state.currentUser);

  const getDms = async () => {
    const url = import.meta.env.VITE_BACKEND_URL;
    const res = await axios.get(`${url}/channel/dms`, {
      withCredentials: true,
    });
    return res.data;
  };

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

  return (
    <div className="w-screen h-screen flex bg-black">
      <DmListSection />

      <div className="relative flex-1 bg-black overflow-hidden">
        <div className="relative z-10 h-full">
          {activeDm ? (
            <OpenDm item={activeDm} />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              <FriendSection />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DmSection;
