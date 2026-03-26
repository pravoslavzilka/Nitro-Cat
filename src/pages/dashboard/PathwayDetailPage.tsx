import { useParams, useLocation } from "react-router-dom";
import { PathwayBuilder } from "@/components/pathway/PathwayBuilder";
import { getPathwayById, samplePathway } from "@/data/pathwayData";
import type { Pathway } from "@/types/pathway";

export const PathwayDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const statePathway = (location.state as { pathway?: Pathway } | null)?.pathway;
  const pathway = statePathway ?? (id ? getPathwayById(id) : undefined) ?? samplePathway;

  return <PathwayBuilder pathway={pathway} />;
};

export default PathwayDetailPage;
