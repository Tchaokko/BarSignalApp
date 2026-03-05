// ─── Request types (from Swagger schemas) ────────────────────────────────────

export interface RegisterRequest {
  email: string | null;
  password: string | null;
  displayName: string | null;
}

export interface LoginRequest {
  email: string | null;
  password: string | null;
}

export interface GoogleAuthRequest {
  idToken: string | null;
}

export interface UserProfileUpdate {
  displayName: string | null;
}

// ─── Response types ───────────────────────────────────────────────────────────
// NOTE: The Swagger spec declares all 200 responses without a body schema.
// These types are inferred placeholders — update once tested against a live API.

export interface AuthResponse {
  token: string;
}

export interface UserProfile {
  id: string;
  email: string;
  displayName: string | null;
}

export type Friend = {
  id: string;
  displayName: string | null;
};

export type FriendsListResponse = Friend[];
