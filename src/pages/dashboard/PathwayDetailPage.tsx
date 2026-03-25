import { useParams, useLocation } from "react-router-dom";
import { PathwayBuilder } from "@/components/pathway/PathwayBuilder";
import { ChatPanel } from "@/components/chat/ChatPanel";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";
import { getPathwayById, samplePathway } from "@/data/pathwayData";
import type { Pathway } from "@/types/pathway";

export const PathwayDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const statePathway = (location.state as { pathway?: Pathway } | null)?.pathway;
  const pathway = statePathway ?? (id ? getPathwayById(id) : undefined) ?? samplePathway;

  return (
    <ResizablePanelGroup direction="horizontal" className="h-full">
      <ResizablePanel defaultSize={55} minSize={30} className="overflow-hidden">
        <PathwayBuilder pathway={pathway} />
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel defaultSize={45} minSize={30} className="overflow-hidden">
        <ChatPanel pathway={pathway} />
      </ResizablePanel>
    </ResizablePanelGroup>
  );
};

export default PathwayDetailPage;
