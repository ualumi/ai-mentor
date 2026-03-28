import fetchProgress from "../api/progress";
import { useQuery } from "@tanstack/react-query";

export function useProgress() {
  const token = localStorage.getItem("token");

  return useQuery({
    queryKey: ["progress"],
    queryFn: () => fetchProgress(token),
  });
}