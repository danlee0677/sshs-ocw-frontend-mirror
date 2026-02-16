import { useState, useEffect } from 'react';
import '@mantine/core/styles.css';
import '@mantine/tiptap/styles.css';
import '@mantine/dropzone/styles.css';
import { BrowserRouter } from 'react-router';
import { http } from './libs/http'
import Router from './Router';
import { MantineProvider, createTheme } from '@mantine/core';
import type { User } from './libs/types'
import { ModalsProvider } from '@mantine/modals'

function App() {
  const theme = createTheme({
    fontFamily: 'Pretendard, Inter, system-ui, Avenir, Helvetica, Arial, sans-serif',
  });
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    http.get(`${import.meta.env.VITE_API_URL}/api/auth/verify`).then((res) => {
      // user-defined: withCredentials: true & attach refreshtoken as default
      setUser(res.data)
    }).catch((err) => {
      setUser(null);
      console.log(err)
    });
  }, [])

  return (
    <MantineProvider theme={theme} >
      <BrowserRouter>
        <ModalsProvider>
          <Router user={user} setUser={setUser} /> 
        </ModalsProvider>
      </BrowserRouter>
    </MantineProvider>
  );
}

export default App;
