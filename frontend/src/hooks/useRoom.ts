import { useMutation, useQuery } from "react-query";

import { ApiService } from "src/services/ApiService";

import { GetRoomIdRes } from "~shared/types/api/room.dto";

export const useGetRoomId = () => {
  const getRoomId = async () => {
    const { data } = await ApiService.get<GetRoomIdRes | undefined>(`/room`);
    return data;
  };
  return { getRoomId };
};

export const useLeaveRoom = () => {
  const leaveRoom = async () => {
    await ApiService.post<void>(`/room/leave`);
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
