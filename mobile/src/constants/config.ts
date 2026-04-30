import { API_BASE_URL } from './env';

export const API_URL = API_BASE_URL;
export const SOCKET_URL = API_BASE_URL.replace('/api', '');
export const API_TIMEOUT = 10000;
