import { redirect } from 'react-router';
import { http, setAccessToken } from '../../libs/http';

export async function clientAction() {
  try {
    await http.post(`${import.meta.env.VITE_API_URL}/api/auth/logout`)
  } catch (err) {
    console.error("Logout failed on server", err);
  }

  setAccessToken(null);
  delete http.defaults.headers.common['Authorization'];

  throw redirect("/login");
}

export async function clientLoader() {
  throw redirect("/")
}