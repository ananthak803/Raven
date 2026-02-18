import React, { useState } from "react";
import Nameplate from "./Nameplate";
import FriendReqModal from "./FriendReqModal";
import { IoPersonAddSharp } from "react-icons/io5";
const FriendSection = () => {
  const [view, setView] = useState(false);
  const [viewPending, setViewPending] = useState(false);
  return (
    <div className="h-full w-full flex flex-col text-white">
      <div className="h-[10%] bg-[#0f0f0f]   flex px-4 items-center justify-between">
        <input
          type="text"
          className="h-[55%] w-[25%] rounded-xl px-3 text-white bg-black border-1 border-gray-700"
          placeholder="Search"
        />

        <div>
          <IoPersonAddSharp size={30} onClick={() => setView(true)} />
        </div>
      </div>
      <div className="flex h-full"></div>
      {view && <FriendReqModal setView={setView} />}
      {viewPending && <PendingReqModal setView={setViewPending} />}
    </div>
  );
};

export default FriendSection;
