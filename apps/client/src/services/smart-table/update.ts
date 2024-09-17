import { SmartTableDto, UpdateSmartTableDto } from "@reactive-resume/dto";
import { useMutation } from "@tanstack/react-query";
import { AxiosResponse } from "axios";

import { axios } from "@/client/libs/axios";
import { queryClient } from "@/client/libs/query-client";

export const updateSmartTable = async (data: UpdateSmartTableDto & { id: string }) => {
  const response = await axios.patch<SmartTableDto, AxiosResponse<SmartTableDto>, UpdateSmartTableDto>(
    `/smart-table/${data.id}`,
    data
  );

  return response.data;
};

export const useUpdateSmartTable = () => {
  const {
    error,
    isPending: loading,
    mutateAsync: updateSmartTableFn,
  } = useMutation({
    mutationFn: updateSmartTable,
    onSuccess: (data) => {
      queryClient.setQueryData<SmartTableDto>(["smart-table", { id: data.id }], data);

      queryClient.setQueryData<SmartTableDto[]>(["smart-tables"], (cache) => {
        if (!cache) return [data];
        return cache.map((item) => (item.id === data.id ? data : item));
      });
    },
  });

  return { updateSmartTable: updateSmartTableFn, loading, error };
};