import { useQuery } from "@tanstack/react-query";
import { User } from "@shared/schema";

export function useAdmin() {
  const { data: user } = useQuery<User>({
    queryKey: ["/api/user"],
  });

  const isAdmin = user?.email?.includes("admin") || false;

  return {
    isAdmin,
    user,
  };
}