import Nameplate from "./Nameplate";
import { useDmStore } from "../../store/useDmStore";

const DmListSection = () => {
  const dms = useDmStore((state) => state.dms);
  const currentUser = useDmStore((state) => state.currentUser);
  const setActiveDm = useDmStore((state) => state.setActiveDm);

  return (
    <div className="w-[20%] bg-[#0f0f0f] h-full p-3 overflow-y-auto border-r border-gray-700">
      {dms.map((item) => {
        if (!currentUser || !item.members) return null;
        const otherUser = item.members.find(
          (member) => member?._id?.toString() !== currentUser?._id?.toString(),
        );

        if (!otherUser) return null;
        const userWithChannel = {
          ...otherUser,
          channelId: item._id,
        };

        return (
          <Nameplate
            key={item._id}
            item={userWithChannel}
            openDm={() => setActiveDm(userWithChannel)}
          />
        );
      })}
    </div>
  );
};

export default DmListSection;
