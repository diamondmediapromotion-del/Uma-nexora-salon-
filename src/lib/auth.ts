import { supabase } from "./supabase";
import { logAuthError } from "./auth-debug";

/**
 * Sign up a new user using email and password.
 * Optionally saves additional user metadata in the auth.users table.
 */
export async function signUpWithEmail(email: string, password: string, metadata?: Record<string, any>) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: metadata,
    },
  });

  if (error) {
    logAuthError(error, "signUpWithEmail");
    if ((error as any).status === 409) {
      console.warn("Auth Debug - User already exists (409 conflict)");
    }
  }

  return { data, error };
}

/**
 * Sign in an existing user with email and password.
 */
export async function signInWithEmail(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    logAuthError(error, "signInWithEmail");
  }

  return { data, error };
}

/**
 * Sign in with Google provider.
 */
export async function signInWithGoogle() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: window.location.origin,
    },
  });

  if (error) {
    logAuthError(error, "signInWithGoogle");
  }

  return { data, error };
}

/**
 * Sign out the currently logged in user.
 */
export async function signOut() {
  const { error } = await supabase.auth.signOut();

  if (error) {
    logAuthError(error, "signOut");
  }

  return { error };
}

/**
 * Retrieve the current authenticated user.
 */
export async function getCurrentUser() {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) {
    return null;
  }
  return user;
}

/**
 * Retrieve the current active session.
 */
export async function getCurrentSession() {
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error) {
    return null;
  }
  return session;
}
