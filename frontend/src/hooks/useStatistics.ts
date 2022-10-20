import { useQuery } from "react-query";

import { ApiService } from "src/services/ApiService";

import { UserStatisticsRes } from "~shared/types/api";

export const useGetUserStatistics = () => {
  const getUserStatistics = async () => {
    const { data } = await ApiService.get<UserStatisticsRes | undefined>(
      `/user/statistics`,
    );
    return data;
  };
  const { data: statistics, isLoading: isGetUserStatisticsLoading } = useQuery(
    ["STATISTICS"],
    getUserStatistics,
  );
  return {
    statistics,
    isGetUserStatisticsLoading,
  };
};
