import React from "react";
import { useAuth } from "../contexts/AuthContext";

export default function AuthDebugger() {
  const { user, session, loading, refreshSession } = useAuth();

  if (loading) return <div className="fixed bottom-4 right-4 p-2 bg-yellow-100 text-[10px] z-[9999] rounded">Auth...</div>;

  return (
    <div className="fixed bottom-4 right-4 z-[9999] group">
      {/* Compact indicator */}
      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm shadow-lg cursor-pointer transition-all duration-300 ${session ? "bg-green-600" : "bg-red-600"}`}>
        {session ? "✅" : "❌"}
      </div>
      
      {/* Expanded content */}
      <div className="hidden group-hover:block absolute bottom-12 right-0 w-64 p-4 bg-slate-900 text-white text-[10px] rounded-lg shadow-xl overflow-auto max-h-64 transition-all duration-300">
        <h3 className="font-bold border-b border-slate-700 pb-1 mb-1">Auth Debugger</h3>
        <p>Status: {session ? "✅ Active" : "❌ Inactive"}</p>
        {user && (
          <>
            <p className="truncate">Email: {user.email}</p>
            <p className="truncate">ID: {user.id}</p>
          </>
        )}
        <button 
          onClick={() => refreshSession()}
          className="mt-2 w-full bg-blue-600 hover:bg-blue-700 px-2 py-1 rounded"
        >
          Refresh Session
        </button>
      </div>
    </div>
  );
}
