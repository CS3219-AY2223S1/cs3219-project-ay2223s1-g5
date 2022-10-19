import { useCallback } from "react";
import { useQuery, useQueryClient } from "react-query";

import { QUERY_KEYS } from "src/constants/query-keys";
import { ApiService } from "src/services/ApiService";

import { GetSubmissionsRes } from "~shared/types/api";

export const useGetSubmissions = (roomId?: string) => {
  const getSubmissions = async () => {
    const { data } = await ApiService.get<GetSubmissionsRes | undefined>(
      `/room/${roomId}/submissions`,
    );

    if (!data) {
      return [];
    }

    return data.submissions.sort((x, y) => {
      return x.submitTime > y.submitTime ? -1 : 0;
    });
  };
  const { data: submissions, isLoading: isGetSubmissionsLoading } = useQuery(
    [QUERY_KEYS.SUBMISSIONS, roomId || ""],
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
    queryClient.invalidateQueries([QUERY_KEYS.SUBMISSIONS, roomId]);
  }, [queryClient, roomId]);
  return { refreshSubmissions };
};
