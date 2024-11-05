import { useLocation } from "react-router-dom";
import Layout from "../components/Layout";
import { useEffect, useState } from "react";
import EmployeeAnalytics from "@/components/EmployeeAnalytics";
import Dash from "@/components/Dash";
import { useUser } from "@/context/userContext";
import Profile from "./Profile";

const Dashboard = () => {
  const [tab, setTab] = useState("");
  const {user} = useUser();
  const location = useLocation();

  const TABS = ["employee-analytics", "tab-2", "tab-3", "tab-4", "tab-5"];

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const tabFromUrl = urlParams.get("tab") || "";
    setTab(TABS.includes(tabFromUrl) ? tabFromUrl : "");
  }, [location.search]);

  const renderTabContent = () => {
    switch (tab) {
      case "employee-analytics":
        return <EmployeeAnalytics />;
      // Add other cases here for the other tabs as needed
      default:
        return (
          user?.role === "admin" || user?.role === "hr" ? (
            <Dash />
          ) : (
            <Profile/>
          )
        );
        
    }
  };

  return <Layout>{renderTabContent()}</Layout>;
};

export default Dashboard;
