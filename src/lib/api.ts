// const API_BASE = process.env.NEXT_PUBLIC_API_URL || 
//   (typeof window !== "undefined" && window.location.hostname === "localhost" 
//     ? "http://localhost:8000/api/v1" 
//     : "https://togethermyanmar.org/api/v1");
// const API_BASE = process.env.NEXT_PUBLIC_API_URL ||
//   (typeof window !== "undefined" && window.location.hostname === "localhost"
//     ? "http://localhost:8000/api/v1"
//     : "https://togethermyanmar.org/api/v1");


// const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://togethermyanmar.org/api/v1";
const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

// We ensure IMAGE_BASE points to the API root so that Nginx proxies /uploads correctly
export const IMAGE_BASE = API_BASE.replace("/api/v1", "");

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const body = await res.json().catch(() => ({ detail: res.statusText }));
    throw new ApiError(res.status, body.detail || "Something went wrong");
  }
  return res.json() as Promise<T>;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
}

export interface AuthUser {
  id: string;
  email: string;
  role: string;
  is_active: boolean;
  is_email_verified: boolean;
  preferred_language: string;
  created_at: string;
  last_login_at: string | null;
}

export interface RegisterPayload {
  email: string;
  password: string;
  preferred_language?: string;
}

export interface RegistrationResponse {
  message: string;
  email: string;
  debug_code?: string | null;
}

export interface VerifyEmailResponse {
  message: string;
  access_token: string;
  token_type: string;
}

export async function loginUser(email: string, password: string): Promise<TokenResponse> {
  const body = new URLSearchParams({ username: email, password });
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  return handleResponse<TokenResponse>(res);
}

export async function registerUser(payload: RegisterPayload): Promise<RegistrationResponse> {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return handleResponse<RegistrationResponse>(res);
}

export async function verifyEmail(email: string, code: string): Promise<VerifyEmailResponse> {
  const res = await fetch(`${API_BASE}/auth/verify-email`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, code }),
  });
  return handleResponse<VerifyEmailResponse>(res);
}

export async function resendVerification(email: string): Promise<{ message: string }> {
  const res = await fetch(`${API_BASE}/auth/resend-verification`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  return handleResponse<{ message: string }>(res);
}

export interface ForgotPasswordResponse {
  message: string;
  debug_code?: string | null;
}

export async function forgotPassword(email: string): Promise<ForgotPasswordResponse> {
  const res = await fetch(`${API_BASE}/auth/forgot-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  return handleResponse<ForgotPasswordResponse>(res);
}

export async function resetPassword(
  email: string,
  code: string,
  new_password: string,
): Promise<{ message: string }> {
  const res = await fetch(`${API_BASE}/auth/reset-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, code, new_password }),
  });
  return handleResponse<{ message: string }>(res);
}

export async function getMe(token: string): Promise<AuthUser> {
  const res = await fetch(`${API_BASE}/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return handleResponse<AuthUser>(res);
}

// ─── Admin Stats ──────────────────────────────────────────────────────────────

export interface AdminStats {
  users: { total: number; verified: number; active: number };
  news: { total: number; published: number };
  resources: { total: number; approved: number; pending: number };
  messages: { total: number };
  volunteers: { total: number };
  forum: { threads: number };
  events: { total: number };
  diaspora: { pending: number };
}

export async function getAdminStats(token: string): Promise<AdminStats> {
  const res = await fetch(`${API_BASE}/admin/stats`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return handleResponse<AdminStats>(res);
}

export interface AdminUser {
  id: string;
  email: string;
  role: string;
  preferred_language: string;
  is_email_verified: boolean;
  is_active: boolean;
  created_at: string | null;
}

export interface AdminUsersResponse {
  total: number;
  users: AdminUser[];
}

export async function getAdminUsers(
  token: string,
  params?: { skip?: number; limit?: number; search?: string; role?: string }
): Promise<AdminUsersResponse> {
  const qs = new URLSearchParams();
  if (params?.skip !== undefined) qs.set("skip", String(params.skip));
  if (params?.limit !== undefined) qs.set("limit", String(params.limit));
  if (params?.search) qs.set("search", params.search);
  if (params?.role && params.role !== "all") qs.set("role", params.role);
  const res = await fetch(`${API_BASE}/admin/users?${qs}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return handleResponse<AdminUsersResponse>(res);
}

export interface AdminUserProfile {
  user: { id: string; email: string; role: string; is_active: boolean; is_email_verified: boolean; created_at: string | null };
  profile: { full_name: string; city: string | null; bio: string | null; country_id: number | null; show_in_diaspora_directory: boolean; privacy_allow_connection_requests: boolean } | null;
  family: { id: string; relationship_label: string; related_name_free_text: string | null; related_user_id: string | null }[];
}

export async function getAdminUserProfile(token: string, userId: string): Promise<AdminUserProfile> {
  const res = await fetch(`${API_BASE}/admin/users/${userId}/profile`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return handleResponse<AdminUserProfile>(res);
}

export async function adminUpdateUser(
  token: string,
  userId: string,
  data: { is_active?: boolean; role?: string }
): Promise<{ id: string; email: string; role: string; is_active: boolean; is_email_verified: boolean }> {
  const res = await fetch(`${API_BASE}/admin/users/${userId}`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}

// ─── CMS Content types ────────────────────────────────────────────────────────

export interface ContentBlock {
  id: number;
  key: string;
  title: string;
  body_en: string;
  body_my: string;
  body_th: string;
  body_ms: string;
  is_active: boolean;
}

export interface AdvisoryMember {
  id: number;
  name: string;
  role: string;
  bio: string;
  image_url: string | null;
  category: string;
  display_order: number;
  is_active: boolean;
}

export interface Testimonial {
  id: number;
  author_name: string;
  author_location: string;
  quote_en: string;
  quote_my: string;
  is_active: boolean;
  display_order: number;
}

export async function getContentBlocks(): Promise<ContentBlock[]> {
  const res = await fetch(`${API_BASE}/content/blocks`, { cache: "no-store" });
  return handleResponse<ContentBlock[]>(res);
}

export async function getAdvisoryMembers(): Promise<AdvisoryMember[]> {
  const res = await fetch(`${API_BASE}/content/advisory`, { cache: "no-store" });
  return handleResponse<AdvisoryMember[]>(res);
}

export async function getTestimonials(): Promise<Testimonial[]> {
  const res = await fetch(`${API_BASE}/content/testimonials`, { cache: "no-store" });
  return handleResponse<Testimonial[]>(res);
}

export async function upsertContentBlock(token: string, data: Omit<ContentBlock, "id" | "is_active">): Promise<ContentBlock> {
  const res = await fetch(`${API_BASE}/content/blocks`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ ...data, is_active: true }),
  });
  return handleResponse<ContentBlock>(res);
}

export async function createAdvisoryMember(token: string, data: Omit<AdvisoryMember, "id">): Promise<AdvisoryMember> {
  const res = await fetch(`${API_BASE}/content/advisory`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(data),
  });
  return handleResponse<AdvisoryMember>(res);
}

export async function deleteAdvisoryMember(token: string, id: number): Promise<void> {
  const res = await fetch(`${API_BASE}/content/advisory/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok && res.status !== 204) {
    const body = await res.json().catch(() => ({ detail: res.statusText }));
    throw new ApiError(res.status, body.detail);
  }
}

export async function createTestimonial(token: string, data: Omit<Testimonial, "id">): Promise<Testimonial> {
  const res = await fetch(`${API_BASE}/content/testimonials`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(data),
  });
  return handleResponse<Testimonial>(res);
}

export async function deleteTestimonial(token: string, id: number): Promise<void> {
  const res = await fetch(`${API_BASE}/content/testimonials/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok && res.status !== 204) {
    const body = await res.json().catch(() => ({ detail: res.statusText }));
    throw new ApiError(res.status, body.detail);
  }
}

// ─── Resource Hub types & functions ──────────────────────────────────────────

export interface ResourceCategory {
  id: number;
  slug: string;
  name_en: string;
  name_my: string;
  group_name: string | null;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface Resource {
  id: string;
  category_id: number;
  country: string | null;
  resource_type: string | null;
  submitted_by: string | null;
  title_en: string;
  title_my: string;
  description_en: string;
  description_my: string;
  external_url: string;
  is_verified: boolean;
  status: "pending" | "approved" | "rejected";
  rejection_reason: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ResourceSubmitPayload {
  category_id: number;
  country?: string;
  resource_type?: string;
  title_en: string;
  title_my?: string;
  description_en: string;
  description_my?: string;
  external_url: string;
}

export async function getResourceCategories(): Promise<ResourceCategory[]> {
  const res = await fetch(`${API_BASE}/resources/categories`, { cache: "no-store" });
  return handleResponse<ResourceCategory[]>(res);
}

export async function getResources(params?: {
  category_id?: number;
  country?: string;
  resource_type?: string;
  search?: string;
}): Promise<Resource[]> {
  const qs = new URLSearchParams();
  if (params?.category_id != null) qs.set("category_id", String(params.category_id));
  if (params?.country) qs.set("country", params.country);
  if (params?.resource_type) qs.set("resource_type", params.resource_type);
  if (params?.search) qs.set("search", params.search);
  const res = await fetch(`${API_BASE}/resources?${qs}`, { cache: "no-store" });
  return handleResponse<Resource[]>(res);
}

export async function getResource(id: string): Promise<Resource> {
  const res = await fetch(`${API_BASE}/resources/${id}`, { cache: "no-store" });
  return handleResponse<Resource>(res);
}

export async function submitResource(token: string, data: ResourceSubmitPayload): Promise<Resource> {
  const res = await fetch(`${API_BASE}/resources/submit`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(data),
  });
  return handleResponse<Resource>(res);
}

export async function getAdminResources(token: string, status?: string): Promise<Resource[]> {
  const qs = status ? `?status=${status}` : "";
  const res = await fetch(`${API_BASE}/resources/admin/list${qs}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  return handleResponse<Resource[]>(res);
}

export async function moderateResource(
  token: string,
  id: string,
  data: { status?: string; is_verified?: boolean; rejection_reason?: string }
): Promise<Resource> {
  const res = await fetch(`${API_BASE}/resources/${id}/moderate`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(data),
  });
  return handleResponse<Resource>(res);
}

export async function createResourceCategory(
  token: string,
  data: { slug: string; name_en: string; name_my?: string; group_name?: string; display_order?: number }
): Promise<ResourceCategory> {
  const res = await fetch(`${API_BASE}/resources/categories`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(data),
  });
  return handleResponse<ResourceCategory>(res);
}

export async function updateResourceCategory(
  token: string,
  id: number,
  data: Partial<{ slug: string; name_en: string; name_my: string; group_name: string; display_order: number }>
): Promise<ResourceCategory> {
  const res = await fetch(`${API_BASE}/resources/categories/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(data),
  });
  return handleResponse<ResourceCategory>(res);
}

export async function deleteResourceCategory(token: string, id: number): Promise<void> {
  const res = await fetch(`${API_BASE}/resources/categories/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok && res.status !== 204) throw new ApiError(res.status, res.statusText);
}

// ─── User Profile ──────────────────────────────────────────────────────────────

export interface UserProfile {
  id: string;
  user_id: string;
  full_name: string;
  city: string | null;
  bio: string | null;
  country_id: number | null;
  preferred_language: string | null;
  avatar_url: string | null;
  show_in_diaspora_directory: boolean;
  privacy_allow_connection_requests: boolean;
  created_at: string;
  updated_at: string;
}


export interface UserProfilePayload {
  full_name: string;
  city?: string;
  bio?: string;
  country_id?: number;
  preferred_language?: string;
  show_in_diaspora_directory?: boolean;
  privacy_allow_connection_requests?: boolean;
}

export interface SiteSetting {
  key: string;
  value_bool: boolean | null;
  value_str: string | null;
  description: string | null;
  is_public: boolean;
}


export interface FamilyRelationship {
  id: string;
  user_id: string;
  related_user_id: string | null;
  relationship_label: string;
  related_name_free_text: string | null;
  created_at: string;
  updated_at: string;
}

export async function getMyProfile(token: string): Promise<UserProfile> {
  const res = await fetch(`${API_BASE}/profile/me`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  return handleResponse<UserProfile>(res);
}

export async function upsertMyProfile(token: string, data: UserProfilePayload): Promise<UserProfile> {
  const res = await fetch(`${API_BASE}/profile/me`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(data),
  });
  return handleResponse<UserProfile>(res);
}

export async function uploadAvatar(token: string, file: File): Promise<UserProfile> {
  const form = new FormData();
  form.append("file", file);
  const res = await fetch(`${API_BASE}/profile/me/avatar`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: form,
  });
  return handleResponse<UserProfile>(res);
}

export async function getFamilyRelationships(token: string): Promise<FamilyRelationship[]> {
  const res = await fetch(`${API_BASE}/profile/me/family`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  return handleResponse<FamilyRelationship[]>(res);
}

export async function addFamilyRelationship(
  token: string,
  data: { relationship_label: string; related_name_free_text?: string; related_user_id?: string }
): Promise<FamilyRelationship> {
  const res = await fetch(`${API_BASE}/profile/me/family`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(data),
  });
  return handleResponse<FamilyRelationship>(res);
}

export async function deleteFamilyRelationship(token: string, id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/profile/me/family/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok && res.status !== 204) {
    const body = await res.json().catch(() => ({ detail: res.statusText }));
    throw new ApiError(res.status, body.detail);
  }
}

export async function updateFamilyRelationship(
  token: string,
  id: string,
  data: { relationship_label?: string; related_name_free_text?: string | null; related_user_id?: string | null }
): Promise<FamilyRelationship> {
  const res = await fetch(`${API_BASE}/profile/me/family/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(data),
  });
  return handleResponse<FamilyRelationship>(res);
}

export async function lookupUserByEmail(
  token: string,
  email: string
): Promise<{ id: string; masked_email: string }> {
  const res = await fetch(`${API_BASE}/profile/users/lookup?email=${encodeURIComponent(email)}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return handleResponse<{ id: string; masked_email: string }>(res);
}

export interface Country {
  id: number;
  iso_code: string;
  name_en: string;
  name_my: string;
  name_th: string;
  name_ms: string;
}

export async function getCountries(): Promise<Country[]> {
  const res = await fetch(`${API_BASE}/profile/countries`, { cache: "no-store" });
  return handleResponse<Country[]>(res);
}

export async function getPublicSettings(): Promise<Record<string, any>> {
  const res = await fetch(`${API_BASE}/settings`, { cache: "no-store" });
  return handleResponse<Record<string, any>>(res);
}

export async function adminGetSettings(token: string): Promise<SiteSetting[]> {
  const res = await fetch(`${API_BASE}/admin/settings`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  return handleResponse<SiteSetting[]>(res);
}

export async function adminUpdateSetting(
  token: string,
  key: string,
  data: { value_bool?: boolean; value_str?: string }
): Promise<SiteSetting> {
  const res = await fetch(`${API_BASE}/admin/settings/${key}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(data),
  });
  return handleResponse<SiteSetting>(res);
}

// ─── 2FA ──────────────────────────────────────────────────────────────────────

export async function get2FAStatus(token: string): Promise<{ enabled: boolean }> {
  const res = await fetch(`${API_BASE}/auth/2fa/status`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return handleResponse<{ enabled: boolean }>(res);
}

export async function setup2FA(token: string): Promise<{ secret: string; qr_code: string; provisioning_uri: string }> {
  const res = await fetch(`${API_BASE}/auth/2fa/setup`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
  return handleResponse<{ secret: string; qr_code: string; provisioning_uri: string }>(res);
}

export async function enable2FA(token: string, code: string): Promise<{ message: string }> {
  const res = await fetch(`${API_BASE}/auth/2fa/enable`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ code }),
  });
  return handleResponse<{ message: string }>(res);
}

export async function disable2FA(token: string, code: string): Promise<{ message: string }> {
  const res = await fetch(`${API_BASE}/auth/2fa/disable`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ code }),
  });
  return handleResponse<{ message: string }>(res);
}

// ─── Notifications ───────────────────────────────────────────────────────────

export interface Notification {
  id: string;
  user_id: string;
  type: string;
  message: string;
  reference_type: string | null;
  reference_id: string | null;
  is_read: boolean;
  read_at: string | null;
  created_at: string;
}

export async function getNotifications(token: string, unreadOnly = false): Promise<Notification[]> {
  const qs = unreadOnly ? "?unread_only=true" : "";
  const res = await fetch(`${API_BASE}/notifications${qs}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  return handleResponse<Notification[]>(res);
}

export async function getUnreadNotificationCount(token: string): Promise<number> {
  const res = await fetch(`${API_BASE}/notifications/unread-count`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  const data = await handleResponse<{ count: number }>(res);
  return data.count;
}

export async function markNotificationRead(token: string, id: string): Promise<Notification> {
  const res = await fetch(`${API_BASE}/notifications/${id}/read`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${token}` },
  });
  return handleResponse<Notification>(res);
}

export async function markAllNotificationsRead(token: string): Promise<void> {
  const res = await fetch(`${API_BASE}/notifications/read-all`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
  await handleResponse<unknown>(res);
}

// ─── Reconnection ─────────────────────────────────────────────────────────────

export interface ConnectionRequest {
  id: string;
  sender_id: string;
  receiver_id: string;
  message: string | null;
  status: "pending" | "approved" | "rejected" | "blocked";
  responded_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Connection {
  id: string;
  connection_request_id: string;
  user_id_1: string;
  user_id_2: string;
  connected_at: string;
  created_at: string;
  updated_at: string;
}

export interface PrivateMessage {
  id: string;
  connection_id: string;
  sender_id: string;
  body: string;
  is_read: boolean;
  read_at: string | null;
  created_at: string;
}

export async function sendConnectionRequest(
  token: string,
  receiver_id: string,
  message?: string
): Promise<ConnectionRequest> {
  const res = await fetch(`${API_BASE}/reconnection/requests`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ receiver_id, message }),
  });
  return handleResponse<ConnectionRequest>(res);
}

export async function getIncomingRequests(token: string): Promise<ConnectionRequest[]> {
  const res = await fetch(`${API_BASE}/reconnection/requests/incoming`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  return handleResponse<ConnectionRequest[]>(res);
}

export async function getOutgoingRequests(token: string): Promise<ConnectionRequest[]> {
  const res = await fetch(`${API_BASE}/reconnection/requests/outgoing`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  return handleResponse<ConnectionRequest[]>(res);
}

export async function respondToRequest(
  token: string,
  requestId: string,
  approve: boolean
): Promise<ConnectionRequest> {
  const res = await fetch(`${API_BASE}/reconnection/requests/${requestId}/respond`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ approve }),
  });
  return handleResponse<ConnectionRequest>(res);
}

export async function cancelConnectionRequest(token: string, requestId: string): Promise<void> {
  const res = await fetch(`${API_BASE}/reconnection/requests/${requestId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok && res.status !== 204) {
    const body = await res.json().catch(() => ({ detail: res.statusText }));
    throw new ApiError(res.status, body.detail);
  }
}

export async function getMyConnections(token: string): Promise<Connection[]> {
  const res = await fetch(`${API_BASE}/reconnection/connections`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  return handleResponse<Connection[]>(res);
}

export async function removeConnection(token: string, connectionId: string): Promise<void> {
  const res = await fetch(`${API_BASE}/reconnection/connections/${connectionId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok && res.status !== 204) {
    const body = await res.json().catch(() => ({ detail: res.statusText }));
    throw new ApiError(res.status, body.detail);
  }
}

export async function blockUser(token: string, targetUserId: string): Promise<void> {
  const res = await fetch(`${API_BASE}/reconnection/block/${targetUserId}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok && res.status !== 204) {
    const body = await res.json().catch(() => ({ detail: res.statusText }));
    throw new ApiError(res.status, body.detail);
  }
}

export async function getMessages(
  token: string,
  connectionId: string,
  skip = 0,
  limit = 50
): Promise<PrivateMessage[]> {
  const res = await fetch(
    `${API_BASE}/reconnection/messages/${connectionId}?skip=${skip}&limit=${limit}`,
    { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" }
  );
  return handleResponse<PrivateMessage[]>(res);
}

export async function sendMessage(
  token: string,
  connectionId: string,
  body: string
): Promise<PrivateMessage> {
  const res = await fetch(`${API_BASE}/reconnection/messages/${connectionId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ body }),
  });
  return handleResponse<PrivateMessage>(res);
}


// --- Community Module ---------------------------------------------------------

export interface ForumCategory {
  id: number;
  name_en: string;
  name_my: string;
  name_th: string;
  name_ms: string;
  description_en: string | null;
  slug: string;
  display_order: number;
  is_active: boolean;
  thread_count: number;
  latest_activity_at: string | null;
  latest_thread_title: string | null;
  created_at: string;
  updated_at: string;
}

export interface ForumThread {
  id: string;
  category_id: number;
  author_id: string;
  author_display_name: string | null;
  title: string;
  body: string;
  status: "open" | "closed" | "removed";
  is_pinned: boolean;
  view_count: number;
  reply_count: number;
  last_reply_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ForumReply {
  id: string;
  thread_id: string;
  author_id: string;
  author_display_name: string | null;
  body: string;
  status: "visible" | "removed";
  created_at: string;
  updated_at: string;
}

export interface ForumReport {
  id: string;
  reporter_id: string;
  thread_id: string | null;
  reply_id: string | null;
  reason: string;
  status: "pending" | "reviewed" | "dismissed";
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface CommunityEvent {
  id: string;
  title_en: string;
  title_my: string;
  title_th: string;
  title_ms: string;
  description_en: string | null;
  event_type: "online" | "in_person" | "hybrid";
  starts_at: string;
  ends_at: string | null;
  location_name: string | null;
  location_address: string | null;
  online_url: string | null;
  is_published: boolean;
  status: "pending" | "approved" | "rejected";
  approved_by: string | null;
  approved_at: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface Program {
  id: number;
  category: "youth" | "women";
  title_en: string;
  title_my: string;
  title_th: string;
  title_ms: string;
  description_en: string | null;
  image_url: string | null;
  event_id: string | null;
  external_url: string | null;
  display_order: number;
  is_published: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface DiasporaListing {
  id: string;
  listing_type: "individual" | "organization";
  name: string;
  description: string | null;
  city: string | null;
  country_id: number | null;
  contact_email: string | null;
  website_url: string | null;
  status: "pending" | "approved" | "rejected";
  user_id: string | null;
  approved_by: string | null;
  approved_at: string | null;
  created_at: string;
  updated_at: string;
}

// Forum
export async function getForumCategories(): Promise<ForumCategory[]> {
  const res = await fetch(`${API_BASE}/community/forum/categories`, { cache: "no-store" });
  return handleResponse<ForumCategory[]>(res);
}

export async function getForumThreads(categoryId: number, skip = 0, limit = 50): Promise<ForumThread[]> {
  const res = await fetch(`${API_BASE}/community/forum/categories/${categoryId}/threads?skip=${skip}&limit=${limit}`, { cache: "no-store" });
  return handleResponse<ForumThread[]>(res);
}

export async function getForumThread(threadId: string): Promise<ForumThread> {
  const res = await fetch(`${API_BASE}/community/forum/threads/${threadId}`, { cache: "no-store" });
  return handleResponse<ForumThread>(res);
}

export async function createForumThread(token: string, data: { category_id: number; title: string; body: string }): Promise<ForumThread> {
  const res = await fetch(`${API_BASE}/community/forum/threads`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(data),
  });
  return handleResponse<ForumThread>(res);
}

export async function getForumReplies(threadId: string): Promise<ForumReply[]> {
  const res = await fetch(`${API_BASE}/community/forum/threads/${threadId}/replies`, { cache: "no-store" });
  return handleResponse<ForumReply[]>(res);
}

export async function createForumReply(token: string, threadId: string, body: string): Promise<ForumReply> {
  const res = await fetch(`${API_BASE}/community/forum/threads/${threadId}/replies`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ body }),
  });
  return handleResponse<ForumReply>(res);
}

export async function reportForumContent(token: string, data: { thread_id?: string; reply_id?: string; reason: string }): Promise<ForumReport> {
  const res = await fetch(`${API_BASE}/community/forum/reports`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(data),
  });
  return handleResponse<ForumReport>(res);
}

// Events
export async function getCommunityEvents(skip = 0, limit = 50): Promise<CommunityEvent[]> {
  const res = await fetch(`${API_BASE}/community/events?skip=${skip}&limit=${limit}`, { cache: "no-store" });
  return handleResponse<CommunityEvent[]>(res);
}

export async function getCommunityEvent(id: string): Promise<CommunityEvent> {
  const res = await fetch(`${API_BASE}/community/events/${id}`, { cache: "no-store" });
  return handleResponse<CommunityEvent>(res);
}

/** Authenticated user submits an event for admin approval */
export async function submitUserEvent(token: string, data: Partial<CommunityEvent>): Promise<CommunityEvent> {
  const res = await fetch(`${API_BASE}/community/events`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(data),
  });
  return handleResponse<CommunityEvent>(res);
}

/** Get all events submitted by the current user (any status) */
export async function getMyEvents(token: string): Promise<CommunityEvent[]> {
  const res = await fetch(`${API_BASE}/community/events/my`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  return handleResponse<CommunityEvent[]>(res);
}

export async function adminCreateEvent(token: string, data: Partial<CommunityEvent>): Promise<CommunityEvent> {
  const res = await fetch(`${API_BASE}/community/events`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(data),
  });
  return handleResponse<CommunityEvent>(res);
}

export async function adminUpdateEvent(token: string, id: string, data: Partial<CommunityEvent>): Promise<CommunityEvent> {
  const res = await fetch(`${API_BASE}/community/events/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(data),
  });
  return handleResponse<CommunityEvent>(res);
}

export async function adminDeleteEvent(token: string, id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/community/events/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok && res.status !== 204) throw new ApiError(res.status, res.statusText);
}

export async function adminListAllEvents(token: string): Promise<CommunityEvent[]> {
  const res = await fetch(`${API_BASE}/community/events/all`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  return handleResponse<CommunityEvent[]>(res);
}

/** Admin: get events pending approval */
export async function adminListPendingEvents(token: string): Promise<CommunityEvent[]> {
  const res = await fetch(`${API_BASE}/community/events/pending`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  return handleResponse<CommunityEvent[]>(res);
}

/** Admin: approve or reject an event */
export async function adminApproveEvent(
  token: string,
  id: string,
  eventStatus: "approved" | "rejected",
): Promise<CommunityEvent> {
  const res = await fetch(`${API_BASE}/community/events/${id}/approve`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ status: eventStatus }),
  });
  return handleResponse<CommunityEvent>(res);
}

// Programs
export async function getPrograms(category?: "youth" | "women"): Promise<Program[]> {
  const qs = category ? `?category=${category}` : "";
  const res = await fetch(`${API_BASE}/community/programs${qs}`, { cache: "no-store" });
  return handleResponse<Program[]>(res);
}

export async function adminCreateProgram(token: string, data: Partial<Program>): Promise<Program> {
  const res = await fetch(`${API_BASE}/community/programs`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(data),
  });
  return handleResponse<Program>(res);
}

export async function adminUpdateProgram(token: string, id: number, data: Partial<Program>): Promise<Program> {
  const res = await fetch(`${API_BASE}/community/programs/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(data),
  });
  return handleResponse<Program>(res);
}

export async function adminDeleteProgram(token: string, id: number): Promise<void> {
  const res = await fetch(`${API_BASE}/community/programs/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok && res.status !== 204) throw new ApiError(res.status, res.statusText);
}

// Diaspora Directory
export async function getDiasporaListings(params?: { search?: string; country_id?: number; listing_type?: string; skip?: number; limit?: number }): Promise<DiasporaListing[]> {
  const qs = new URLSearchParams();
  if (params?.search) qs.set("search", params.search);
  if (params?.country_id) qs.set("country_id", String(params.country_id));
  if (params?.listing_type) qs.set("listing_type", params.listing_type);
  if (params?.skip != null) qs.set("skip", String(params.skip));
  if (params?.limit != null) qs.set("limit", String(params.limit));
  const res = await fetch(`${API_BASE}/community/diaspora?${qs}`, { cache: "no-store" });
  return handleResponse<DiasporaListing[]>(res);
}

export async function submitDiasporaListing(token: string, data: Partial<DiasporaListing>): Promise<DiasporaListing> {
  const res = await fetch(`${API_BASE}/community/diaspora`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(data),
  });
  return handleResponse<DiasporaListing>(res);
}

export async function adminGetPendingListings(token: string): Promise<DiasporaListing[]> {
  const res = await fetch(`${API_BASE}/community/diaspora/pending`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  return handleResponse<DiasporaListing[]>(res);
}

export async function adminGetAllListings(token: string): Promise<DiasporaListing[]> {
  const res = await fetch(`${API_BASE}/community/diaspora/all`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  return handleResponse<DiasporaListing[]>(res);
}

export async function getMyDiasporaListings(token: string): Promise<DiasporaListing[]> {
  const res = await fetch(`${API_BASE}/community/diaspora/my`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  return handleResponse<DiasporaListing[]>(res);
}

export async function adminApproveListing(token: string, id: string): Promise<DiasporaListing> {
  const res = await fetch(`${API_BASE}/community/diaspora/${id}/approve`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
  return handleResponse<DiasporaListing>(res);
}

export async function adminRejectListing(token: string, id: string): Promise<DiasporaListing> {
  const res = await fetch(`${API_BASE}/community/diaspora/${id}/reject`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
  return handleResponse<DiasporaListing>(res);
}

export async function adminDeleteDiasporaListing(token: string, id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/community/diaspora/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok && res.status !== 204) throw new ApiError(res.status, res.statusText);
}

export async function adminCreateForumCategory(
  token: string,
  data: { name_en: string; name_my?: string; name_th?: string; name_ms?: string; description_en?: string; slug: string; display_order?: number }
): Promise<ForumCategory> {
  const res = await fetch(`${API_BASE}/community/forum/categories`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(data),
  });
  return handleResponse<ForumCategory>(res);
}

export async function adminUpdateForumCategory(
  token: string,
  id: number,
  data: Partial<{ name_en: string; name_my: string; name_th: string; name_ms: string; description_en: string; slug: string; display_order: number; is_active: boolean }>
): Promise<ForumCategory> {
  const res = await fetch(`${API_BASE}/community/forum/categories/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(data),
  });
  return handleResponse<ForumCategory>(res);
}

export async function adminGetForumReports(token: string, pendingOnly = true): Promise<ForumReport[]> {
  const res = await fetch(`${API_BASE}/community/forum/reports?pending_only=${pendingOnly}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  return handleResponse<ForumReport[]>(res);
}

export async function adminReviewForumReport(
  token: string,
  reportId: string,
  reviewStatus: "reviewed" | "dismissed"
): Promise<ForumReport> {
  const res = await fetch(`${API_BASE}/community/forum/reports/${reportId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ status: reviewStatus }),
  });
  return handleResponse<ForumReport>(res);
}

export async function adminDeleteForumThread(token: string, threadId: string): Promise<void> {
  const res = await fetch(`${API_BASE}/community/forum/threads/${threadId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok && res.status !== 204) throw new ApiError(res.status, res.statusText);
}

export async function adminPatchForumThread(
  token: string,
  threadId: string,
  data: { status?: string; is_pinned?: boolean }
): Promise<ForumThread> {
  const res = await fetch(`${API_BASE}/community/forum/threads/${threadId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(data),
  });
  return handleResponse<ForumThread>(res);
}

export async function adminDeleteForumReply(token: string, replyId: string): Promise<void> {
  const res = await fetch(`${API_BASE}/community/forum/replies/${replyId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok && res.status !== 204) throw new ApiError(res.status, res.statusText);
}

export async function adminListAllPrograms(token: string): Promise<Program[]> {
  const res = await fetch(`${API_BASE}/community/programs/all`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  return handleResponse<Program[]>(res);
}


// ─── News ─────────────────────────────────────────────────────────────────────

export interface NewsCategory {
  id: number;
  name_en: string;
  name_my: string;
  name_th: string;
  name_ms: string;
  slug: string;
  display_order: number;
  is_active: boolean;
  post_count: number;
  created_at: string;
  updated_at: string;
}

export interface NewsPost {
  id: string;
  author_id: string;
  author_name: string | null;
  title_en: string;
  title_my: string;
  title_th: string;
  title_ms: string;
  body_en: string;
  body_my: string;
  body_th: string;
  body_ms: string;
  slug: string;
  image_url: string | null;
  status: "draft" | "published" | "archived";
  published_at: string | null;
  created_at: string;
  updated_at: string;
  categories: NewsCategory[];
}

export interface NewsListResponse {
  total: number;
  posts: NewsPost[];
}

export async function getNewsCategories(): Promise<NewsCategory[]> {
  const res = await fetch(`${API_BASE}/news/categories`, { cache: "no-store" });
  return handleResponse<NewsCategory[]>(res);
}

export async function getNews(params?: {
  search?: string;
  category_id?: number;
  category_slug?: string;
  sort?: string;
  page?: number;
  limit?: number;
}): Promise<NewsListResponse> {
  const qs = new URLSearchParams();
  if (params?.search) qs.set("search", params.search);
  if (params?.category_id) qs.set("category_id", String(params.category_id));
  if (params?.category_slug) qs.set("category_slug", params.category_slug);
  if (params?.sort) qs.set("sort", params.sort);
  if (params?.page) qs.set("page", String(params.page));
  if (params?.limit) qs.set("limit", String(params.limit));
  const res = await fetch(`${API_BASE}/news?${qs}`, { cache: "no-store" });
  return handleResponse<NewsListResponse>(res);
}

export async function getNewsPost(id: string): Promise<NewsPost> {
  const res = await fetch(`${API_BASE}/news/${id}`, { cache: "no-store" });
  return handleResponse<NewsPost>(res);
}

export async function adminListAllNews(token: string): Promise<NewsPost[]> {
  const res = await fetch(`${API_BASE}/news/all`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  return handleResponse<NewsPost[]>(res);
}

export async function adminCreateNews(token: string, data: Partial<NewsPost> & { category_ids?: number[] }): Promise<NewsPost> {
  const res = await fetch(`${API_BASE}/news`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return handleResponse<NewsPost>(res);
}

export async function adminUpdateNews(token: string, id: string, data: Partial<NewsPost> & { category_ids?: number[] }): Promise<NewsPost> {
  const res = await fetch(`${API_BASE}/news/${id}`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return handleResponse<NewsPost>(res);
}

export async function adminDeleteNews(token: string, id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/news/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok && res.status !== 204) throw new ApiError(res.status, res.statusText);
}

export async function adminUploadNewsImage(token: string, file: File): Promise<{ url: string }> {
  const formData = new FormData();
  formData.append("file", file);
  const res = await fetch(`${API_BASE}/admin/upload-news-image`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });
  return handleResponse<{ url: string }>(res);
}

export async function adminCreateNewsCategory(token: string, data: Partial<NewsCategory>): Promise<NewsCategory> {
  const res = await fetch(`${API_BASE}/news/categories`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return handleResponse<NewsCategory>(res);
}

export async function adminUpdateNewsCategory(
  token: string,
  id: number,
  data: Partial<Pick<NewsCategory, "name_en" | "name_my" | "name_th" | "name_ms" | "slug" | "display_order" | "is_active">>
): Promise<NewsCategory> {
  const res = await fetch(`${API_BASE}/news/categories/${id}`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return handleResponse<NewsCategory>(res);
}

export async function adminDeleteNewsCategory(token: string, id: number): Promise<void> {
  const res = await fetch(`${API_BASE}/news/categories/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok && res.status !== 204) throw new ApiError(res.status, res.statusText);
}

export async function getAdjacentNewsPosts(
  id: string
): Promise<{ prev: { id: string; title_en: string } | null; next: { id: string; title_en: string } | null }> {
  const res = await fetch(`${API_BASE}/news/${id}/adjacent`, { cache: "no-store" });
  return handleResponse<{ prev: { id: string; title_en: string } | null; next: { id: string; title_en: string } | null }>(res);
}


// ─── Contact / Volunteer / FAQs ──────────────────────────────────────────────

export interface FAQ {
  id: number;
  question_en: string;
  answer_en: string;
  question_my: string;
  answer_my: string;
  is_published: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string | null;
  message: string;
  ip_address: string | null;
  created_at: string;
  updated_at: string;
}

export interface VolunteerSignup {
  id: string;
  full_name: string;
  email: string;
  country_id: number | null;
  country: string | null;
  areas_of_interest: string | null;
  message: string | null;
  created_at: string;
  updated_at: string;
}

export interface PartnershipInquiry {
  id: string;
  organization_name: string;
  contact_name: string;
  email: string;
  message: string;
  created_at: string;
  updated_at: string;
}

export async function submitContactMessage(data: { name: string; email: string; subject?: string; message: string }): Promise<ContactMessage> {
  const res = await fetch(`${API_BASE}/contact/message`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return handleResponse<ContactMessage>(res);
}

export async function submitVolunteerSignup(data: { full_name: string; email: string; country_id?: number; country?: string; areas_of_interest?: string; message?: string }): Promise<VolunteerSignup> {
  const res = await fetch(`${API_BASE}/contact/volunteer`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return handleResponse<VolunteerSignup>(res);
}

export async function submitPartnershipInquiry(data: { organization_name: string; contact_name: string; email: string; message: string }): Promise<PartnershipInquiry> {
  const res = await fetch(`${API_BASE}/contact/partnership`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return handleResponse<PartnershipInquiry>(res);
}

export async function getFAQs(): Promise<FAQ[]> {
  const res = await fetch(`${API_BASE}/contact/faqs`, { cache: "no-store" });
  return handleResponse<FAQ[]>(res);
}

export async function adminListContactMessages(token: string): Promise<ContactMessage[]> {
  const res = await fetch(`${API_BASE}/contact/messages`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  return handleResponse<ContactMessage[]>(res);
}

export async function adminListVolunteers(token: string): Promise<VolunteerSignup[]> {
  const res = await fetch(`${API_BASE}/contact/volunteers`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  return handleResponse<VolunteerSignup[]>(res);
}

export async function adminListPartnerships(token: string): Promise<PartnershipInquiry[]> {
  const res = await fetch(`${API_BASE}/contact/partnerships`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  return handleResponse<PartnershipInquiry[]>(res);
}

export async function adminListAllFAQs(token: string): Promise<FAQ[]> {
  const res = await fetch(`${API_BASE}/contact/faqs/all`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  return handleResponse<FAQ[]>(res);
}

export async function adminCreateFAQ(token: string, data: Partial<FAQ>): Promise<FAQ> {
  const res = await fetch(`${API_BASE}/contact/faqs`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return handleResponse<FAQ>(res);
}

export async function adminUpdateFAQ(token: string, id: number, data: Partial<FAQ>): Promise<FAQ> {
  const res = await fetch(`${API_BASE}/contact/faqs/${id}`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return handleResponse<FAQ>(res);
}

export async function adminDeleteFAQ(token: string, id: number): Promise<void> {
  const res = await fetch(`${API_BASE}/contact/faqs/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok && res.status !== 204) throw new ApiError(res.status, res.statusText);
}

// ── Newsletter ────────────────────────────────────────────────────────────────

export interface NewsletterSubscriber {
  id: number;
  email: string;
  created_at: string;
}

/** Public: subscribe an email address to the newsletter. Throws ApiError(409) on duplicate. */
export async function subscribeNewsletter(email: string): Promise<NewsletterSubscriber> {
  const res = await fetch(`${API_BASE}/newsletter/subscribe`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  return handleResponse<NewsletterSubscriber>(res);
}

/** Admin: fetch all newsletter subscribers (supports optional search query). */
export async function adminListNewsletterSubscribers(
  token: string,
  search?: string,
): Promise<NewsletterSubscriber[]> {
  const params = search ? `?search=${encodeURIComponent(search)}` : "";
  const res = await fetch(`${API_BASE}/newsletter/subscribers${params}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  return handleResponse<NewsletterSubscriber[]>(res);
}

/** Admin: remove a subscriber by id. */
export async function adminDeleteNewsletterSubscriber(
  token: string,
  id: number,
): Promise<void> {
  const res = await fetch(`${API_BASE}/newsletter/subscribers/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok && res.status !== 204) throw new ApiError(res.status, res.statusText);
}

