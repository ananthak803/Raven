import React from "react";
import DmSection from "./DmSection";
import GroupSection from "./GroupSection";
import SettingSection from "./SettingSection";
import Home from "./Home";
const SectionContainer = ({ active, peerConnectionRef }) => {
  return (
    <>
      {active === "dm" && <DmSection peerConnectionRef={peerConnectionRef} />}
      {active === "group" && <GroupSection />}
      {active === "setting" && <SettingSection />}
      {active==="" && <Home/>}
    </>
  );
};

export default SectionContainer;
