import type { Enzyme } from "@/types/enzyme";
import { ConfidenceScore } from "./ConfidenceScore";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface EnzymeTableProps {
  enzymes: Enzyme[];
  onSelect?: (enzyme: Enzyme) => void;
}

export const EnzymeTable = ({ enzymes, onSelect }: EnzymeTableProps) => {
  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-secondary">
            <TableHead className="text-xs font-semibold uppercase tracking-wider">Name</TableHead>
            <TableHead className="text-xs font-semibold uppercase tracking-wider">EC Number</TableHead>
            <TableHead className="text-xs font-semibold uppercase tracking-wider">Organism</TableHead>
            <TableHead className="text-xs font-semibold uppercase tracking-wider">kcat</TableHead>
            <TableHead className="text-xs font-semibold uppercase tracking-wider">Km</TableHead>
            <TableHead className="text-xs font-semibold uppercase tracking-wider">Score</TableHead>
            {onSelect && (
              <TableHead className="text-xs font-semibold uppercase tracking-wider">Actions</TableHead>
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {enzymes.length === 0 ? (
            <TableRow>
              <TableCell colSpan={onSelect ? 7 : 6} className="text-center text-muted-foreground py-8">
                No enzymes found
              </TableCell>
            </TableRow>
          ) : (
            enzymes.map((enzyme) => (
              <TableRow key={enzyme.id} className="hover:bg-secondary/50 transition-colors">
                <TableCell className="font-medium text-sm">{enzyme.name}</TableCell>
                <TableCell className="font-mono text-xs text-muted-foreground">{enzyme.ecNumber}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{enzyme.organism}</TableCell>
                <TableCell className="font-mono text-xs">{enzyme.kcat}</TableCell>
                <TableCell className="font-mono text-xs">{enzyme.km}</TableCell>
                <TableCell>
                  <ConfidenceScore score={enzyme.score} />
                </TableCell>
                {onSelect && (
                  <TableCell>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onSelect(enzyme)}
                      className="h-7 text-xs"
                    >
                      Select
                    </Button>
                  </TableCell>
                )}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};
