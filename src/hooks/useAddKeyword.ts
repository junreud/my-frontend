// hooks/useAddKeyword.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/apiClient";
import { toast } from "sonner";

export const useAddKeyword = (userId: number, placeId: number) => {
    const queryClient = useQueryClient();
  
    const mutation = useMutation({
      mutationFn: (keyword: string) =>
        apiClient.post("/keyword/user-keywords", {
          userId,
          placeId,
          keyword,
        }),
      onSuccess: () => {
        toast.success("키워드가 추가되었습니다.");
        queryClient.invalidateQueries({
          queryKey: ['userKeywords', String(userId), String(placeId)],
        });
        queryClient.invalidateQueries({
          queryKey: ['keywordRankingDetails', String(placeId), String(userId)]
        });
      },
      onError: () => {
        toast.error("키워드 추가에 실패했습니다.");
      },
    });
  
    return {
      addKeyword: mutation.mutate,
      isAdding: mutation.isPending,
    };
  };