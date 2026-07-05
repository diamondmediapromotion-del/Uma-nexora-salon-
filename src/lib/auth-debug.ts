export const logSessionState = (session: any) => {
  console.log("Auth Debug - Current Session State:", session ? "Session Active" : "No Session");
  if (session) {
    console.log("Auth Debug - User ID:", session.user?.id);
    console.log("Auth Debug - Email:", session.user?.email);
  }
};

export const logAuthError = (error: any, context: string) => {
  console.error(`Auth Debug - Error in ${context}:`, error);
  if (error?.message) {
    console.error("Auth Debug - Error Message:", error.message);
  }
  if (error?.status) {
    console.error("Auth Debug - Error Status:", error.status);
  }
};
