import axios, { AxiosError, AxiosRequestConfig } from 'axios'

let accessToken: string | null = null;
let isRefreshing: boolean = false;
let refreshPromise: Promise<string | null> | null = null;

type RetriableConfig = AxiosRequestConfig & { _retried?: boolean }

export const http = axios.create({
  withCredentials: true,
})

export function setAccessToken(token: string | null) {
  accessToken = token;
  if (token) http.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  else delete http.defaults.headers.common["Authorization"];
}

// attach auth token on every request
http.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers = config.headers ?? {};

    if (!("Authorization" in config.headers)) {
      config.headers["Authorization"] = `Bearer ${accessToken}`
    }
  }
  return config
})

function refreshAccessToken(): Promise<string | null> {
  if (isRefreshing && refreshPromise) return refreshPromise

  isRefreshing = true;
  refreshPromise = axios.post(
    `${process.env.REACT_APP_API_URL}/api/auth/refresh`, {}, { withCredentials: true }
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

  //const original_req = config.

  console.log("asdff")
  if (status === 401 && !config._retried &&
    !/\/api\/auth\/refresh$/.test(config.url || "") 
    // when hitting /api/auth/refresh and encountering 401(example: refresh token expire)
    // prevent infinite loop
  ) {
    config._retried = true;
    console.log("asdff")
    try {
      accessToken = await refreshAccessToken()
      console.log(accessToken)
      if (!accessToken) {
        throw new Error("Failed to get new valid accessToken");
      }

    } catch (error) {
      console.log(error)
      try {
        await axios.post(`${process.env.REACT_APP_API_URL}/api/auth/logout`, {}, { withCredentials: true }) 
      } catch {}
      
    }
  }

  return err;
})