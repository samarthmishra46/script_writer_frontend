export const API_BASE_URL = 'https://endearing-cupcake-aa8d2f.netlify.app:5000';

// Helper function to build API URLs
export const buildApiUrl = (endpoint: string): string => {
    return `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
}; 