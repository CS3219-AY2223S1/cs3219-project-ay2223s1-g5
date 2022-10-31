import { useQuery } from "react-query";

import { QUERY_KEYS } from "src/constants/query-keys";
import { ApiService } from "src/services/ApiService";

import { UserStatisticsRes } from "~shared/types/api";

export const useUserStatistics = () => {
  const getUserStatistics = async () => {
    const { data } = await ApiService.get<UserStatisticsRes | undefined>(
      `/user/statistics`,
    );
    return data;
  };
  const { data: userStatistics, isLoading: isUserStatisticsLoading } = useQuery(
    [QUERY_KEYS.STATISTICS],
    getUserStatistics,
  );
  return {
    userStatistics,
    isUserStatisticsLoading,
  };
};
