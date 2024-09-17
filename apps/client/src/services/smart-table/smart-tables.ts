import { SmartTableDto } from "@reactive-resume/dto";
import { useQuery } from "@tanstack/react-query";
import { AxiosResponse } from "axios";

import { SMART_TABLES_KEY } from "@/client/constants/query-keys";
import { axios } from "@/client/libs/axios";

export const fetchSmartTables = async () => {
  const response = await axios.get<SmartTableDto[], AxiosResponse<SmartTableDto[]>>("/smart-table");

  return response.data;
};

export const useSmartTables = () => {
  const {
    error,
    isPending: loading,
    data: smartTables,
  } = useQuery({
    queryKey: SMART_TABLES_KEY,
    queryFn: fetchSmartTables,
  });

  return { smartTables, loading, error };
};