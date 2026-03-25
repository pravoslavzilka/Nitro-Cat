import { useState } from "react";
import { PathwayViewer } from "@/components/PathwayViewer";
import { AiChatConsole } from "@/components/AiChatConsole";
import { AppSidebar } from "@/components/AppSidebar";
import { samplePathway } from "@/data/pathwayData";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";

const Index = () => {
  const [activeSession, setActiveSession] = useState("1");

  const handleNewChat = (pathwayId: string) => {
    console.log("New chat with pathway:", pathwayId);
    setActiveSession(Date.now().toString());
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <AppSidebar
        activeSessionId={activeSession}
        onSelectSession={setActiveSession}
        onNewChat={handleNewChat}
      />
      <ResizablePanelGroup direction="horizontal" className="flex-1">
        <ResizablePanel defaultSize={55} minSize={30}>
          <PathwayViewer pathway={samplePathway} />
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={45} minSize={30}>
          <AiChatConsole />
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
};

export default Index;
