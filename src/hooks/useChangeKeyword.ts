// hooks/useChangeKeyword.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/apiClient";
import { toast } from "sonner";

export const useChangeKeyword = (userId: number, placeId: number) => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: ({ keywordId, newKeyword }: { keywordId: number; newKeyword: string }) =>
      apiClient.post("/keyword/change-user-keyword", {
        userId,
        placeId,
        keywordId,
        newKeyword,
      }),
    onSuccess: () => {
      toast.success("키워드가 변경되었습니다.");
      queryClient.invalidateQueries({
        queryKey: ['userKeywords', String(userId), String(placeId)],
      });
      queryClient.invalidateQueries({
        queryKey: ['keywordRankingDetails', String(placeId), String(userId)]
      });
    },
    onError: () => {
      toast.error("키워드 변경에 실패했습니다.");
    },
  });

  return {
    changeKeyword: mutation.mutate,
    isChanging: mutation.isPending,
  };
};