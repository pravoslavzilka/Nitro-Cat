import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { NitroAIChat } from "@/components/chat/NitroAIChat";

export const DashboardLayout = () => {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">

        <main className="flex-1 overflow-hidden">
          <Outlet />
        </main>
      </div>
      <NitroAIChat />
    </div>
  );
};
