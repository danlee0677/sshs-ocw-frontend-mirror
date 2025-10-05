import React from 'react';
import { useState } from 'react';
import '@mantine/core/styles.css';
import { BrowserRouter } from 'react-router';
import Router from './Router';
import { MantineProvider, createTheme } from '@mantine/core';
import { User } from './libs/types'

function App() {
  const theme = createTheme({
    fontFamily: 'Noto Sans KR, Inter, system-ui, Avenir, Helvetica, Arial, sans-serif'
  });
  const [user, setUser] = useState<User | null>(null);

  return (
    <MantineProvider theme={theme} >
      <BrowserRouter>
        <Router user={user} />
      </BrowserRouter>
    </MantineProvider>
  );
}

export default App;
