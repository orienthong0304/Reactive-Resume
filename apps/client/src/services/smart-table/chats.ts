import { ChatDto, CreateChatDto } from "@reactive-resume/dto";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosResponse } from "axios";

import { axios } from "@/client/libs/axios";

export const fetchChats = async (smartTableId: string) => {
  const response = await axios.get<ChatDto[], AxiosResponse<ChatDto[]>>(`/smart-table/${smartTableId}/chats`);
  return response.data;
};

export const useChats = (smartTableId: string) => {
  const {
    error,
    isPending: loading,
    data: chats,
  } = useQuery({
    queryKey: ["chats", smartTableId],
    queryFn: () => fetchChats(smartTableId),
  });

  return { chats, loading, error };
};

export const createChat = async (data: CreateChatDto) => {
  const response = await axios.post<ChatDto, AxiosResponse<ChatDto>, CreateChatDto>(
    `/smart-table/${data.smartTableId}/chats`,
    data
  );
  return response.data;
};

export const useCreateChat = () => {
  const queryClient = useQueryClient();

  const {
    error,
    isPending: loading,
    mutateAsync: createChatFn,
  } = useMutation({
    mutationFn: createChat,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["chats", variables.smartTableId] });
    },
  });

  return { createChat: createChatFn, loading, error };
};