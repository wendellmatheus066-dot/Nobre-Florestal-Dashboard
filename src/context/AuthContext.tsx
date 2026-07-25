import { createContext, useContext, useEffect, useState } from "react";

type AuthContextType = {
  isAdmin: boolean;
  login: (password: string) => boolean;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType>({
  isAdmin: false,
  login: () => false,
  logout: () => {},
});

export function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const logged = localStorage.getItem("isAdmin");

    if (logged === "true") {
      setIsAdmin(true);
    }
  }, []);

  function login(password: string) {
    if (password === "123456") {
      localStorage.setItem("isAdmin", "true");
      setIsAdmin(true);
      return true;
    }

    return false;
  }

  function logout() {
    localStorage.removeItem("isAdmin");
    setIsAdmin(false);
  }

  return (
    <AuthContext.Provider
      value={{
        isAdmin,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}