import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getPathway, getPathways, createPathway, updatePathway, deletePathway } from '@/lib/api/pathways';
import type { Pathway } from '@/types/pathway';

export function usePathways() {
  return useQuery({
    queryKey: ['pathways'],
    queryFn: getPathways,
  });
}

export function usePathway(id: string) {
  return useQuery({
    queryKey: ['pathways', id],
    queryFn: () => getPathway(id),
    enabled: !!id,
  });
}

export function useCreatePathway() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Pathway>) => createPathway(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pathways'] });
    },
  });
}

export function useUpdatePathway() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Pathway> }) => updatePathway(id, data),
    onSuccess: (_result, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['pathways', id] });
      queryClient.invalidateQueries({ queryKey: ['pathways'] });
    },
  });
}

export function useDeletePathway() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deletePathway(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pathways'] });
    },
  });
}
