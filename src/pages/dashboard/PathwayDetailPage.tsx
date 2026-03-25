import { useParams } from "react-router-dom";
import { PathwayBuilder } from "@/components/pathway/PathwayBuilder";
import { ChatPanel } from "@/components/chat/ChatPanel";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";
import { samplePathway } from "@/data/pathwayData";

export const PathwayDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  // For now use samplePathway data regardless of id
  const pathway = { ...samplePathway, id: id ?? '1' };

  return (
    <ResizablePanelGroup direction="horizontal" className="h-full">
      <ResizablePanel defaultSize={55} minSize={30}>
        <PathwayBuilder pathway={pathway} />
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel defaultSize={45} minSize={30}>
        <ChatPanel />
      </ResizablePanel>
    </ResizablePanelGroup>
  );
};

export default PathwayDetailPage;
