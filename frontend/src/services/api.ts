const API_BASE = '/api/v1';

function getToken(): string | null {
  return localStorage.getItem('kalasetu_token');
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    ...(options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.error || 'Server error occurred');
  }

  return data;
}

export const api = {
  // Auth
  registerCustomer: (body: any) => request<any>('/auth/register-customer', { method: 'POST', body: JSON.stringify(body) }),
  requestArtisanOtp: (phoneNumber: string, lang = 'hi') => request<any>('/auth/artisan-otp-request', { method: 'POST', body: JSON.stringify({ phoneNumber, lang }) }),
  verifyArtisanOtp: (body: any) => request<any>('/auth/artisan-otp-verify', { method: 'POST', body: JSON.stringify(body) }),
  login: (identifier: string, password: string) => request<any>('/auth/login', { method: 'POST', body: JSON.stringify({ identifier, password }) }),
  getMe: () => request<any>('/auth/me'),

  // Clusters
  getClusters: () => request<{ success: boolean; clusters: any[] }>('/clusters'),
  getCluster: (slugOrId: string) => request<{ success: boolean; cluster: any }>(`/clusters/${slugOrId}`),

  // Artisans
  getArtisans: (params: Record<string, string> = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request<{ success: boolean; artisans: any[] }>(`/artisans${qs ? `?${qs}` : ''}`);
  },
  getArtisan: (id: string) => request<{ success: boolean; artisan: any }>(`/artisans/${id}`),
  updateArtisanProfile: (body: any) => request<any>('/artisans/profile', { method: 'PATCH', body: JSON.stringify(body) }),
  getMyArtisanDashboard: () => request<any>('/artisans/my/dashboard'),

  // Products
  getProducts: (params: Record<string, any> = {}) => {
    const qs = new URLSearchParams(params as any).toString();
    return request<{ success: boolean; products: any[]; totalCount: number; totalPages: number }>(`/products${qs ? `?${qs}` : ''}`);
  },
  getProduct: (idOrSlug: string) => request<{ success: boolean; product: any }>(`/products/${idOrSlug}`),
  createProduct: (body: any) => request<any>('/products', { method: 'POST', body: JSON.stringify(body) }),
  addReview: (productId: string, body: any) => request<any>(`/products/${productId}/reviews`, { method: 'POST', body: JSON.stringify(body) }),

  updateProduct: (id: string, body: object) => request<any>(`/products/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
  updatePackaging: (id: string, packagingStatus: string) =>
    request<any>(`/artisans/my/orders/${id}/packaging`, { method: 'PATCH', body: JSON.stringify({ packagingStatus }) }),
  uploadMedia: (file: File) => {
    const body = new FormData();
    body.append('file', file);
    return request<{ url: string }>('/media', { method: 'POST', body });
  },

  // AI Multimodal
  multimodalOnboard: (body: { voiceTranscript: string; spokenLang: string; imageMeta?: any }) =>
    request<any>('/ai/multimodal-onboard', { method: 'POST', body: JSON.stringify(body) }),
  semanticSearch: (q: string) => request<{ success: boolean; products: any[] }>(`/ai/semantic-search?q=${encodeURIComponent(q)}`),

  // Orders & SafeTransit
  checkout: (body: any) => request<any>('/orders/checkout', { method: 'POST', body: JSON.stringify(body) }),
  getMyOrders: () => request<{ success: boolean; orders: any[] }>('/orders/my-orders'),
  trackOrder: (orderNumber: string) => request<{ success: boolean; order: any }>(`/orders/track/${orderNumber}`),
  reportBreakage: (orderId: string, body: any) => request<any>(`/orders/${orderId}/breakage-claim`, { method: 'POST', body: JSON.stringify(body) }),

  // Payments (Razorpay)
  createRazorpayOrder: (orderId: string) => request<any>('/payments/create-razorpay', { method: 'POST', body: JSON.stringify({ orderId }) }),
  verifyPayment: (body: any) => request<any>('/payments/verify', { method: 'POST', body: JSON.stringify(body) }),

  // Custom Commissions
  createCommission: (body: any) => request<any>('/commissions', { method: 'POST', body: JSON.stringify(body) }),
  getCommissions: () => request<{ success: boolean; commissions: any[] }>('/commissions'),
  approveMilestone: (commissionId: string, milestoneId: string) =>
    request<any>(`/commissions/${commissionId}/milestones/${milestoneId}/approve`, { method: 'POST' }),

  // Admin
  getAdminOverview: () => request<{ success: boolean; analytics: any }>('/admin/overview'),
  getPendingQueue: () => request<any>('/admin/pending-queue'),
  updateArtisanStatus: (id: string, status: string, notes?: string) =>
    request<any>(`/admin/artisan/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status, notes }) }),
  updateProductStatus: (id: string, status: string, moderationNotes?: string) =>
    request<any>(`/admin/product/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status, moderationNotes }) }),
  disbursePayout: (body: any) => request<any>('/admin/disburse-payouts', { method: 'POST', body: JSON.stringify(body) }),
};
