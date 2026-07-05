import React, { useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";

export default function ProtectedRoute({ children, navigateTo }: { children: React.ReactNode, navigateTo: (path: string) => void }) {
  const { session, loading } = useAuth();

  useEffect(() => {
    if (!loading && !session) {
      navigateTo("/login");
    }
  }, [loading, session, navigateTo]);

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!session) return null;

  return <>{children}</>;
}
