// Penjelasan:
// Setup axios: otomatis sisipkan token ke header + auto refresh token saat 401.
import axios from 'axios';

import { authStore } from '~/lib/auth/store';
import { ApiError } from '~/lib/errors/api-error';
import { refreshToken } from '~/server/auth';

export const instance = axios.create();

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1',
});

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: Error | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

api.interceptors.request.use((config) => {
  const authToken = authStore.getState().accessToken;
  const headers = config.headers ?? {};

  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  return {
    ...config,
    headers,
  };
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise(function (resolve, reject) {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers['Authorization'] = 'Bearer ' + token;

            return axios(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const data = await refreshToken();

        if (data === null) {
          throw new Error('No auth cookie available');
        }

        if (ApiError.isErrorResponse(data)) {
          throw new ApiError(data);
        }

        authStore.setState(data.data);

        const { accessToken } = data.data;
        const authorization = `Bearer ${accessToken}`;

        api.defaults.headers.common['Authorization'] = authorization;
        originalRequest.headers['Authorization'] = authorization;

        processQueue(null, accessToken);

        return axios(originalRequest);
      } catch (err) {
        processQueue(err instanceof Error ? err : new Error(String(err)), null);
        // If the refresh token is expired, redirect to the sign-in page

        // handleLogout();

        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    const apiError = ApiError.fromAxiosError(error);

    return Promise.reject(apiError);
  },
);

/// Log out the user by clearing the auth cookie and redirecting to the sign-in page

// async function handleLogout() {
//   authStore.setState({
//     accessToken: null,
//     refreshToken: null,
//   });

//   await signOut();

//   window.location.href = '/auth/sign-in?code=session_expired';
// }
