import axios, { AxiosError, AxiosRequestConfig } from 'axios'

let accessToken: string | null = null;

type RetriableConfig = AxiosRequestConfig & { _retried: boolean }

export const http = axios.create({
  withCredentials: true,
})

http.interceptors.request.use((config) => {
  if (accessToken && config.headers && !config.headers.Authorization) {
    config.headers["Authorization"] = `Bearer ${accessToken}`
  }
  return config
})

http.interceptors.response.use((res) => res, async (err) => {
  const status = err.response?.status;
  const config: RetriableConfig = err.config || {};
  
  if (status === 401 && !config._retried &&
    !/\/api\/auth\/refresh$/.test(config.url || "") 
    // when hitting /api/auth/refresh and encountering 401(example: refresh token expire)
    // prevent infinite loop
  ) {
    config._retried = true;
    
    await axios.post(`${process.env.API_URL}/api/auth/refresh`, {}, { withCredentials: true })
    .then(async (response) => {
      const newToken = response.data.token;
      if (!newToken) {
        console.log("No access token in refresh res")
        await axios.post(`${process.env.API_URL}/api/auth/logout`, {}, { withCredentials: true })
      }
      accessToken = newToken
    }).catch(async (error) => {
      console.log(error)
      await axios.post(`${process.env.API_URL}/api/auth/logout`, {}, { withCredentials: true })
      
    })
  }

  return err
})