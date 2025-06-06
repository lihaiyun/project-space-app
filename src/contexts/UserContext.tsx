import React, { useState, useEffect } from "react";
import http from "@/utils/http";

type UserType = {
  _id: string;
  name: string;
  email: string;
};

const UserContext = React.createContext<{
  user: UserType | null;
  setUser: (user: UserType | null) => void;
}>({
  user: null,
  setUser: () => {},
});

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<UserType | null>(null);

  useEffect(() => {
    console.log("User Provider mounted...");
    http.get("/users/auth")
      .then(res => setUser(res.data.user))
      .catch(() => setUser(null));
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
};

export default UserContext;