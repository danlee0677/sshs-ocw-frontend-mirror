import axios, { AxiosError, type AxiosRequestConfig } from 'axios'

let accessToken: string | null = null;
let isRefreshing: boolean = false;
let refreshPromise: Promise<string | null> | null = null;

type RetriableConfig = AxiosRequestConfig & { _retried?: boolean; _tokenAtRequest?: string | null }

export const http = axios.create({
  withCredentials: true,
})

export function setAccessToken(token: string | null) {
  accessToken = token;
}

// attach auth token on every request and stamp it for stale-401 detection
http.interceptors.request.use((config) => {
  const c = config as RetriableConfig;
  c._tokenAtRequest = accessToken;
  if (accessToken) {
    config.headers = config.headers ?? {};
    config.headers["Authorization"] = `Bearer ${accessToken}`;
  }
  return config;
})

function refreshAccessToken(): Promise<string | null> {
  if (isRefreshing && refreshPromise) return refreshPromise

  isRefreshing = true;
  refreshPromise = axios.post(
    `${import.meta.env.VITE_API_URL}/api/auth/refresh`, {}, { withCredentials: true }
  ).then((res) => {
    const newToken: string | undefined = res?.data?.token;
    if (!newToken) throw new Error("No accessToken returned in response");
    setAccessToken(newToken);
    return newToken
  }).catch((err) => {
    setAccessToken(null)
    return Promise.reject(err);
  }).finally(() => {
    isRefreshing = false;
    refreshPromise = null;
  })

  return refreshPromise
}



http.interceptors.response.use((res) => res, async (err: AxiosError) => {
  const status = err.response?.status;
  const config: RetriableConfig = err.config || {} as RetriableConfig;
  
  const url = config.url || "";
  const isRefresh = /\/api\/auth\/refresh$/.test(url); // check if this is refresh
  const isLogout = /\/api\/auth\/logout$/.test(url); // check if this is logout

  if (status === 401 && !config._retried && !isRefresh && !isLogout) {

    config._retried = true;

    // If the token has already been refreshed since this request was sent, retry immediately
    if (config._tokenAtRequest !== accessToken && accessToken) {
      config.headers = config.headers ?? {};
      config.headers.Authorization = `Bearer ${accessToken}`;
      return http.request(config);
    }

    try {
      const newToken = await refreshAccessToken()
      if (!newToken) {
        throw new Error("Failed to get new valid accessToken");
      }
      config.headers = config.headers ?? {};
      config.headers.Authorization = `Bearer ${newToken}`;

      return http.request(config)

    } catch (error) {
      console.log(error)

      return Promise.reject(error);
    }
  }

  return Promise.reject(err);
})