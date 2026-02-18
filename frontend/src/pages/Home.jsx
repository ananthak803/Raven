import React, {  useState } from "react";
import SidebarShowcase from "../components/normal/SiderbarShowcase";
import SectionContainer from "../components/normal/SectionContainer";
const Home = () => {

  const [activeItem, setActiveItem] = useState("dm");

  return (
    <div className="h-screen flex">
      <SidebarShowcase
        activeItem={activeItem}
        setActiveItem={setActiveItem}
      />
      <SectionContainer active={activeItem} />
    </div>
  );
};

export default Home;
