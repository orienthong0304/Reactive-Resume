import { SmartTableDto } from "@reactive-resume/dto";
import { useQuery } from "@tanstack/react-query";
import { AxiosResponse } from "axios";

import { axios } from "@/client/libs/axios";

export const fetchSmartTable = async (id: string) => {
  const response = await axios.get<SmartTableDto, AxiosResponse<SmartTableDto>>(`/smart-table/${id}`);
  return response.data;
};

export const useSmartTable = (id: string) => {
  const {
    error,
    isPending: loading,
    data: smartTable,
  } = useQuery({
    queryKey: ["smart-table", id],
    queryFn: () => fetchSmartTable(id),
  });

  return { smartTable, loading, error };
};