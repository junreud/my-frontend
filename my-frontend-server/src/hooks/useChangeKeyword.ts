// hooks/useChangeKeyword.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/apiClient";
import { toast } from "sonner";
import axios from "axios";

export const useChangeKeyword = (userId: number, placeId: number) => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({ keywordId, newKeyword }: { keywordId: number; newKeyword: string }) => {
      try {
        const response = await apiClient.post("/keyword/change-user-keyword", {
          userId,
          placeId,
          oldKeywordId: keywordId, // 백엔드에서 "oldKeywordId"로 파라미터 이름을 사용하고 있기 때문에 변경
          newKeyword,
        });
        return response.data;
      } catch (error: unknown) {
        // 상세 에러 메시지 추출
        let errorMessage = "키워드 변경 중 오류가 발생했습니다.";
        if (axios.isAxiosError(error) && error.response?.data) {
          const dataObj = error.response.data as Record<string, unknown>;
          if (typeof dataObj.message === "string") {
            errorMessage = dataObj.message;
          }
        } else if (error instanceof Error) {
          errorMessage = error.message;
        }
        throw new Error(errorMessage);
      }
    },
    onSuccess: () => {
      toast.success("키워드가 변경되었습니다.");
      queryClient.invalidateQueries({
        queryKey: ['userKeywords', String(userId), String(placeId)],
      });
      queryClient.invalidateQueries({
        queryKey: ['keywordRankingDetails', String(placeId), String(userId)]
      });
    },
    onError: (error: Error) => {
      // 오류 메시지 개선
      if (error.message.includes("조건에 맞는 업체가 없습니다")) {
        toast.error("해당 키워드로 검색된 업체가 없습니다. 다른 키워드를 사용해주세요.", {
          duration: 5000,
          id: "no-results-error"
        });
      } else {
        toast.error(`키워드 변경에 실패했습니다: ${error.message}`, {
          duration: 3000
        });
      }
    },
  });

  return {
    changeKeyword: mutation.mutate,
    isChanging: mutation.isPending,
    error: mutation.error
  };
};