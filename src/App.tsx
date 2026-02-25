import { useState, useEffect } from 'react';
import '@mantine/core/styles.css';
import '@mantine/tiptap/styles.css';
import '@mantine/dropzone/styles.css';
import { http } from './libs/http'
import Router from './Router';
import { MantineProvider, createTheme } from '@mantine/core';
import { userSchema, type User } from './libs/types'
import { ModalsProvider } from '@mantine/modals'

function App() {
  const theme = createTheme({
    fontFamily: 'Pretendard, Inter, system-ui, Avenir, Helvetica, Arial, sans-serif',
  });
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        // user-defined: withCredentials: true & attach refreshtoken as default
        const res = await http.get(`${import.meta.env.VITE_API_URL}/api/auth/verify`)
        const parsed = userSchema.safeParse(res.data)
        if (!parsed.success) throw new Error("User does not meet type");
        setUser(parsed.data);
      } catch (err) {
        setUser(null);
        console.error(err);
      }
    }

    fetchUser();
  }, [])

  return (
    <MantineProvider theme={theme} >
      <ModalsProvider>
        <Router user={user} setUser={setUser} />
      </ModalsProvider>
    </MantineProvider>
  );
}

export default App;
