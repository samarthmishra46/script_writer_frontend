//export const API_BASE_URL = 'https://script-writer-backend-tgbq.onrender.com';
export const API_BASE_URL = 'http://localhost:5000';
// Helper function to build API URLs
export const buildApiUrl = (endpoint: string): string => {
    return `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
}; 