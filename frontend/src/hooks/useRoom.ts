import { useMutation, useQuery } from "react-query";

import { ApiService } from "src/services/ApiService";

export const useCheckUserHasRoom = (userId: number) => {
  const userHasRoom = async () => {
    const hasRoom = await ApiService.get<boolean>(`/room/${userId}`);
    return hasRoom;
  };
  const { data: user, isLoading: isUseCheckUserHasRoomLoading } = useQuery(
    ["USER", userId?.toString() || ""],
    userHasRoom,
    {
      enabled: !!userId,
    },
  );
  return {
    user,
    isUseCheckUserHasRoomLoading,
  };
};

export const useLeaveRoom = (userId: number) => {
  const leaveRoom = async () => {
    await ApiService.post<void>(`/room/${userId}/leave`);
  };
  const {
    isLoading: isUseLeaveRoomLoading,
    mutateAsync: useLeaveRoomMutation,
  } = useMutation(leaveRoom);
  return {
    isUseLeaveRoomLoading,
    useLeaveRoomMutation,
  };
};

export const useJoinRoom = (userId: number) => {
  const joinRoom = async () => {
    const { data } = await ApiService.post<void>(`/room/${userId}/join`);
    return data;
  };
  const { isLoading: isUseJoinRoomLoading, mutateAsync: useJoinRoomMutation } =
    useMutation(joinRoom);
  return {
    isUseJoinRoomLoading,
    useJoinRoomMutation,
  };
};
