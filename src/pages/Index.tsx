// Update this page (the content is just a fallback if you fail to update the page)

import { useState } from "react";
import { BottomNav } from "@/components/BottomNav";
import Home from "./Home";
import Vault from "./Vault";
import Sessions from "./Sessions";
import Trends from "./Trends";
import Explorer from "./Explorer";
import Profile from "./Profile";

const Index = () => {
  const [activeTab, setActiveTab] = useState("home");

  const renderContent = () => {
    switch (activeTab) {
      case "home":
        return <Home />;
      case "vault":
        return <Vault />;
      case "sessions":
        return <Sessions />;
      case "trends":
        return <Trends />;
      case "explorer":
        return <Explorer />;
      case "profile":
        return <Profile />;
      default:
        return <Home />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {renderContent()}
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

export default Index;
