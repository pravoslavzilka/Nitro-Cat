import { useParams } from "react-router-dom";
import { PathwayBuilder } from "@/components/pathway/PathwayBuilder";
import { ChatPanel } from "@/components/chat/ChatPanel";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";
import { getPathwayById, samplePathway } from "@/data/pathwayData";

export const PathwayDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const pathway = (id ? getPathwayById(id) : undefined) ?? samplePathway;

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
