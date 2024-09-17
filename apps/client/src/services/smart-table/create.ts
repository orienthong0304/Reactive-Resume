import { SmartTableDto } from "@reactive-resume/dto";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosResponse } from "axios";

import { SMART_TABLES_KEY } from "@/client/constants/query-keys";
import { axios } from "@/client/libs/axios";

export const createSmartTable = async (formData: FormData) => {
  const response = await axios.post<SmartTableDto, AxiosResponse<SmartTableDto>, FormData>(
    "/smart-table",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    },
  );

  return response.data;
};

export const useCreateSmartTable = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: createSmartTable,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: SMART_TABLES_KEY });
    },
  });

  return {
    createSmartTable: mutation.mutateAsync,
    loading: mutation.isPending,
    error: mutation.error,
  };
};