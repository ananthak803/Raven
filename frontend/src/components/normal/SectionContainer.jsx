import React from "react";
import DmSection from "./DmSection";
import GroupSection from "./GroupSection";
import SettingSection from "./SettingSection";

const SectionContainer = ({ active}) => {
  return (
    <>
      {active === "dm" && <DmSection />}
      {active === "group" && <GroupSection />}
      {active === "setting" && <SettingSection />}
    </>
  );
};

export default SectionContainer;
