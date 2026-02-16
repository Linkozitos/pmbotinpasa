import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  listDocuments, uploadDocument, getDocumentById,
  updateDocument, deleteDocument, listFolders, listAllTags,
  type ListDocumentsParams,
} from '@/services/knowledgeBase';

export function useDocuments(params: ListDocumentsParams = {}) {
  return useQuery({
    queryKey: ['knowledge', 'list', params],
    queryFn: () => listDocuments(params),
  });
}

export function useDocument(id: string | null) {
  return useQuery({
    queryKey: ['knowledge', 'detail', id],
    queryFn: () => getDocumentById(id!),
    enabled: !!id,
  });
}

export function useFolders() {
  return useQuery({
    queryKey: ['knowledge', 'folders'],
    queryFn: listFolders,
  });
}

export function useAllTags() {
  return useQuery({
    queryKey: ['knowledge', 'tags'],
    queryFn: listAllTags,
  });
}

export function useUploadDocument() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ file, metadata }: { file: File; metadata: Parameters<typeof uploadDocument>[1] }) =>
      uploadDocument(file, metadata),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['knowledge'] });
    },
  });
}

export function useUpdateDocument() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Parameters<typeof updateDocument>[1] }) =>
      updateDocument(id, patch),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['knowledge'] });
    },
  });
}

export function useDeleteDocument() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteDocument(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['knowledge'] });
    },
  });
}
