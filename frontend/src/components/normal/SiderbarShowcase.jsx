import ravenWhite from "../../assets/raven_white.png";
import { RiMessage2Fill } from "react-icons/ri";
import { MdGroups2 } from "react-icons/md";
import { IoIosSettings } from "react-icons/io";

const SidebarShowcase = ({activeItem,setActiveItem}) => {
  return (
    <div className="flex h-screen bg-gray-300">
      <div className="flex flex-col items-center w-18 h-full bg-[#000000] text-gray-400">

        <img src={ravenWhite} className="h-14 mt-3 mb-2" onClick={()=>setActiveItem("")}/>

        <div className="flex flex-col items-center mt-2">

          <SidebarIcon
            active={activeItem === "dm"}
            onClick={() => setActiveItem("dm")}
          >
            <RiMessage2Fill size={25} />
          </SidebarIcon>

          <SidebarIcon
            active={activeItem === "group"}
            onClick={() => setActiveItem("group")}
          >
            <MdGroups2 size={25} />
          </SidebarIcon>

          <SidebarIcon
            active={activeItem === "setting"}
            onClick={() => setActiveItem("setting")}
          >
            <IoIosSettings size={25} />
          </SidebarIcon>

        </div>
      </div>
    </div>
  );
};

const SidebarIcon = ({ children, active, onClick }) => {
  return (
    <button
      onClick={onClick}
      className={`flex items-center justify-center w-12 h-12 mt-2 rounded transition-all duration-200
        ${
          active
            ? "bg-gray-700 text-white"
            : "hover:bg-gray-700 hover:text-gray-300"
        }`}
    >
      {children}
    </button>
  );
};

export default SidebarShowcase;
