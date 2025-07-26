export const API_BASE_URL = 'https://script-writer-backend-tgbq.onrender.com';

// Helper function to build API URLs
export const buildApiUrl = (endpoint: string): string => {
    return `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
}; 