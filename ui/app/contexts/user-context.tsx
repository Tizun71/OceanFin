"use client";

import { createContext, useContext, useEffect, useState } from "react";

type User = {
  id: string;
  name?: string;
  email?: string;
};

type UserContextType = {
  user: User | null;
  setUser: (user: User | null) => void;
};

const UserContext = createContext<UserContextType>({
  user: null,
  setUser: () => {},
});

export const UserProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {

  const [user, setUser] = useState<User | null>(null);

  // load từ localStorage nếu có
  useEffect(() => {

    const stored = localStorage.getItem("user");

    if (stored) {
      setUser(JSON.parse(stored));
    }

  }, []);

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );

};

export const useUser = () => useContext(UserContext);