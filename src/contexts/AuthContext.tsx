import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<{ error: any }>;
  refreshSession: () => Promise<{ data: { session: Session | null; user: User | null }; error: any }>;
  verifyProfile: (userId: string) => Promise<{ success: boolean; data: any; error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  const handleVerifyProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from("profiles")
      .select("full_name, role, phone")
      .eq("id", userId)
      .single();

    if (error) {
      console.error("Error verifying profile:", error);
      return { success: false, data: null, error };
    }
    
    // Check if required fields are present
    if (!data.full_name || !data.role || !data.phone) {
        console.warn("Profile fields missing:", data);
        return { success: false, data, error: new Error("Missing required profile fields") };
    }

    return { success: true, data, error: null };
  };

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session: initialSession }, error } = await supabase.auth.getSession();
        if (!error && initialSession) {
          setSession(initialSession);
          setUser(initialSession.user);
        }
      } catch (err) {
        console.error("Error fetching initial session:", err);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, currentSession) => {
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (!error) {
      setUser(null);
      setSession(null);
    }
    return { error };
  };

  const handleRefreshSession = async () => {
    const { data, error } = await supabase.auth.refreshSession();
    if (!error && data.session) {
      setSession(data.session);
      setUser(data.session.user);
    }
    return { data, error };
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        signOut: handleSignOut,
        refreshSession: handleRefreshSession,
        verifyProfile: handleVerifyProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
