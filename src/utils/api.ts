/**
 * Utilidad para hacer peticiones HTTP con manejo automático de autenticación
 */

const API_URL = process.env.REACT_APP_API_URL || (process.env.NODE_ENV === 'production' ? 'https://gestion-despachos.onrender.com/api' : 'http://localhost:3002/api');

interface FetchOptions extends RequestInit {
  requireAuth?: boolean;
}

/**
 * Función auxiliar para hacer peticiones con manejo de errores 401
 */
export async function apiFetch(endpoint: string, options: FetchOptions = {}): Promise<Response> {
  const { requireAuth = true, ...fetchOptions } = options;
  
  // Preparar headers con tipo explícito
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  
  // Copiar headers adicionales si existen
  if (fetchOptions.headers) {
    const additionalHeaders = fetchOptions.headers as Record<string, string>;
    Object.assign(headers, additionalHeaders);
  }
  
  // Agregar token si se requiere autenticación
  if (requireAuth) {
    const token = localStorage.getItem('token');
    
    if (!token) {
      console.error('❌ No hay token de autenticación');
      window.location.href = '/login';
      throw new Error('No authentication token');
    }
    
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  // Hacer la petición
  const url = endpoint.startsWith('http') ? endpoint : `${API_URL}${endpoint}`;
  const response = await fetch(url, {
    ...fetchOptions,
    headers,
  });
  
  // Manejar error 401 (token expirado o inválido)
  if (response.status === 401) {
    console.error('❌ Token expirado o inválido (401). Redirigiendo al login...');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
    throw new Error('Unauthorized');
  }
  
  return response;
}

/**
 * GET request
 */
export async function apiGet<T>(endpoint: string): Promise<T> {
  const response = await apiFetch(endpoint, { method: 'GET' });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Error desconocido' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }
  
  return response.json();
}

/**
 * POST request
 */
export async function apiPost<T>(endpoint: string, data: any): Promise<T> {
  const response = await apiFetch(endpoint, {
    method: 'POST',
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Error desconocido' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }
  
  return response.json();
}

/**
 * PUT request
 */
export async function apiPut<T>(endpoint: string, data: any): Promise<T> {
  const response = await apiFetch(endpoint, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Error desconocido' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }
  
  return response.json();
}

/**
 * DELETE request
 */
export async function apiDelete<T>(endpoint: string): Promise<T> {
  const response = await apiFetch(endpoint, { method: 'DELETE' });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Error desconocido' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }
  
  return response.json();
}

export default {
  get: apiGet,
  post: apiPost,
  put: apiPut,
  delete: apiDelete,
};
