import { useCallback } from "react";
import { useQuery, useQueryClient } from "react-query";

import { ApiService } from "src/services/ApiService";

import { GetSubmissionsRes } from "~shared/types/api";

export const useGetSubmissions = (roomId?: string) => {
  const getSubmissions = async () => {
    const { data } = await ApiService.get<GetSubmissionsRes | undefined>(
      `/room/${roomId}/submissions`,
    );
    return data?.submissions.reverse() || [];
  };
  const { data: submissions, isLoading: isGetSubmissionsLoading } = useQuery(
    ["SUBMISSIONS", roomId || ""],
    getSubmissions,
    { enabled: !!roomId },
  );
  return {
    submissions,
    isGetSubmissionsLoading,
  };
};

export const useRefreshSubmissions = (roomId?: string) => {
  const queryClient = useQueryClient();
  const refreshSubmissions = useCallback(() => {
    if (!roomId) {
      return;
    }
    queryClient.invalidateQueries(["SUBMISSIONS", roomId]);
  }, [queryClient, roomId]);
  return { refreshSubmissions };
};
