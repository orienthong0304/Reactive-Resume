import { SmartTableDto } from "@reactive-resume/dto";
import { useMutation } from "@tanstack/react-query";
import { AxiosResponse } from "axios";

import { axios } from "@/client/libs/axios";
import { queryClient } from "@/client/libs/query-client";

export const deleteSmartTable = async (data: { id: string }) => {
  const response = await axios.delete<SmartTableDto, AxiosResponse<SmartTableDto>, { id: string }>(
    `/smart-table/${data.id}`
  );

  return response.data;
};

export const useDeleteSmartTable = () => {
  const {
    error,
    isPending: loading,
    mutateAsync: deleteSmartTableFn,
  } = useMutation({
    mutationFn: deleteSmartTable,
    onSuccess: (data) => {
      queryClient.removeQueries({ queryKey: ["smart-table", data.id] });

      queryClient.setQueryData<SmartTableDto[]>(["smart-tables"], (cache) => {
        if (!cache) return [];
        return cache.filter((smartTable) => smartTable.id !== data.id);
      });
    },
  });

  return { deleteSmartTable: deleteSmartTableFn, loading, error };
};