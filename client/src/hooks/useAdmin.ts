import { useQuery } from "@tanstack/react-query";
import { User } from "@shared/schema";

export function useAdmin() {
  const { data: user } = useQuery<User>({
    queryKey: ["/api/user"],
  });

  const { data: allUsers = [] } = useQuery<User[]>({
    queryKey: ["/api/admin/users"],
    retry: false,
  });

  const isFirstUser = allUsers.length > 0 && allUsers[0].id === user?.id;
  const hasAdminEmail = user?.email?.includes("admin") || false;
  const isAdmin = hasAdminEmail || isFirstUser;

  return {
    isAdmin,
    user,
  };
}