import { createContext, useContext, useEffect, useState } from "react";

type AuthContextType = {
  isAdmin: boolean;
  session: boolean;
  loading: boolean;
  login: (password: string) => boolean;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType>({
  isAdmin: false,
  session: false,
  loading: true,
  login: () => false,
  logout: () => {},
});

export function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [session, setSession] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const logged = localStorage.getItem("isAdmin") === "true";

    setIsAdmin(logged);
    setSession(logged);
    setLoading(false);
  }, []);

  function login(password: string) {
    if (password === "123456") {
      localStorage.setItem("isAdmin", "true");

      setIsAdmin(true);
      setSession(true);

      return true;
    }

    return false;
  }

  function logout() {
    localStorage.removeItem("isAdmin");

    setIsAdmin(false);
    setSession(false);
  }

  return (
    <AuthContext.Provider
      value={{
        isAdmin,
        session,
        loading,
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