import { User } from "@/lib/user/service";
import { createContext } from "react";

export interface UserDataContextType {
  userData: Record<string, User>;
  isLoading: boolean;
}

export const UserDataContext = createContext<UserDataContextType>({
  userData: {},
  isLoading: true,
});
