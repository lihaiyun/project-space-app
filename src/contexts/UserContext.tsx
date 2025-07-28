import React, { useState, useEffect } from "react";
import http from "@/utils/http";

type UserType = {
  id: string;
  name: string;
  email: string;
};

const UserContext = React.createContext<{
  user: UserType | null;
  setUser: (user: UserType | null) => void;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}>({
  user: null,
  setUser: () => {},
  login: async () => {},
  logout: async () => {},
});

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<UserType | null>(null);

  useEffect(() => {
    http.get("/users/auth")
      .then(res => setUser(res.data.user))
      .catch(() => setUser(null));
  }, []);

  const login = async (email: string, password: string) => {
    const response = await http.post("/users/login", { email, password });
    setUser(response.data.user);
  };

  const logout = async () => {
    await http.post("/users/logout");
    setUser(null);
  };

  return (
    <UserContext.Provider value={{ user, setUser, login, logout }}>
      {children}
    </UserContext.Provider>
  );
};

export default UserContext;