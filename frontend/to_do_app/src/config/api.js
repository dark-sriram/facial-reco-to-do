// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const API_ENDPOINTS = {
    BASE: API_BASE_URL,
    USERS: {
        REGISTER: `${API_BASE_URL}/api/users/register`,
        AUTHENTICATE: `${API_BASE_URL}/api/users/authenticate`,
        GET_ALL: `${API_BASE_URL}/api/users`,
        GET_BY_ID: (id) => `${API_BASE_URL}/api/users/${id}`
    },
    NOTES: {
        BASE: `${API_BASE_URL}/api/notes`,
        GET_ALL: `${API_BASE_URL}/api/notes`,
        CREATE: `${API_BASE_URL}/api/notes`,
        UPDATE: (id) => `${API_BASE_URL}/api/notes/${id}`,
        DELETE: (id) => `${API_BASE_URL}/api/notes/${id}`,
        GET_BY_ID: (id) => `${API_BASE_URL}/api/notes/${id}`
    },
    HEALTH: `${API_BASE_URL}/api/health`
};

export default API_ENDPOINTS;