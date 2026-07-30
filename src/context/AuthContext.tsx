import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

type Role = "admin" | "funcionario" | "manejo" | null;

type AuthContextType = {
  role: Role;
  isAdmin: boolean;
  session: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  role: null,
  isAdmin: false,
  session: false,
  loading: true,
  login: async () => false,
  logout: async () => {},
});

export function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [role, setRole] = useState<Role>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [session, setSession] = useState(false);
  const [loading, setLoading] = useState(true);

  async function carregarPerfil(userId: string) {
    const { data } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", userId)
      .single();

    const cargo = (data?.role as Role) ?? null;

    setRole(cargo);
    setIsAdmin(cargo === "admin");
  }
    useEffect(() => {
    async function carregarSessao() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.user) {
        setSession(true);
        await carregarPerfil(session.user.id);
      } else {
        setSession(false);
        setRole(null);
        setIsAdmin(false);
      }

      setLoading(false);
    }

    carregarSessao();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        setSession(true);
        await carregarPerfil(session.user.id);
      } else {
        setSession(false);
        setRole(null);
        setIsAdmin(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  async function login(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    return !error;
  }

  async function logout() {
    await supabase.auth.signOut();

    setSession(false);
    setRole(null);
    setIsAdmin(false);
  }

  return (
    <AuthContext.Provider
      value={{
        role,
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