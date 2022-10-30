import { useMutation, useQuery, useQueryClient } from "react-query";

import { QUERY_KEYS } from "src/constants/query-keys";
import { ApiService } from "src/services/ApiService";

import { GetRoomIdRes } from "~shared/types/api/room.dto";

// export const useGetRoomId = () => {
//   const getRoomId = async () => {
//     const { data } = await ApiService.get<GetRoomIdRes>(`/room`);
//     return data;
//   };
//   return { getRoomId };
// };

export const useGetRoomId = () => {
  const getRoomId = async () => {
    const { data } = await ApiService.get<GetRoomIdRes | undefined>(`/room`);
    return data;
  };
  const { data: roomId, isLoading: isGetRoomIdLoading } = useQuery(
    [QUERY_KEYS.USERS, "ROOM"],
    getRoomId,
  );
  return {
    roomId,
    isGetRoomIdLoading,
  };
};

// export const useLeaveRoom = () => {
//   const leaveRoom = async () => {
//     await ApiService.post<void>(`/room/leave`);
//   };
//   const {
//     isLoading: isUseLeaveRoomLoading,
//     mutateAsync: useLeaveRoomMutation,
//   } = useMutation(leaveRoom);
//   return {
//     isUseLeaveRoomLoading,
//     useLeaveRoomMutation,
//   };
// };

export const useLeaveRoom = () => {
  const queryClient = useQueryClient();
  const leaveRoom = async () => {
    await ApiService.post<void>(`/room/leave`);
    queryClient.invalidateQueries([QUERY_KEYS.USERS, "ROOM"]);
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
