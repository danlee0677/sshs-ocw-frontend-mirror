import React from 'react';
import { useState, useEffect } from 'react';
import '@mantine/core/styles.css';
import '@mantine/tiptap/styles.css';
import { BrowserRouter } from 'react-router';
import { http } from './libs/http'
import Router from './Router';
import { MantineProvider, createTheme } from '@mantine/core';
import { User } from './libs/types'

function App() {
  const theme = createTheme({
    fontFamily: 'Noto Sans KR, Inter, system-ui, Avenir, Helvetica, Arial, sans-serif',
  });
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    http.get(`${process.env.REACT_APP_API_URL}/api/auth/verify`).then((res) => {
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
        <Router user={user} setUser={setUser} />
      </BrowserRouter>
    </MantineProvider>
  );
}

export default App;
