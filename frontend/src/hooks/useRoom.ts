import { useMutation, useQuery, useQueryClient } from "react-query";

import { QUERY_KEYS } from "src/constants/query-keys";
import { ApiService } from "src/services/ApiService";

import { GetRoomIdRes } from "~shared/types/api/room.dto";

export const useRoom = () => {
  const getRoom = async () => {
    const { data } = await ApiService.get<GetRoomIdRes | undefined>(`/room`);
    return data;
  };
  const { data: room, isLoading: isRoomLoading } = useQuery(
    [QUERY_KEYS.USERS, "ROOM"],
    getRoom,
  );
  return {
    room,
    isRoomLoading,
  };
};

export const useLeaveRoom = () => {
  const queryClient = useQueryClient();
  const leaveRoom = async () => {
    await ApiService.delete<void>(`/room`);
    queryClient.invalidateQueries([QUERY_KEYS.USERS, "ROOM"]);
  };
  const { isLoading: isLeaveRoomLoading, mutateAsync: leaveRoomMutation } =
    useMutation(leaveRoom);
  return {
    leaveRoom: leaveRoomMutation,
    isLeaveRoomLoading,
  };
};
