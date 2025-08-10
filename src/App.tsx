import React from 'react';
import '@mantine/core/styles.css';
import { BrowserRouter } from 'react-router';
import Router from './Router';
import { MantineProvider, createTheme } from '@mantine/core';

function App() {
  const theme = createTheme({
    fontFamily: 'Noto Sans KR, Inter, system-ui, Avenir, Helvetica, Arial, sans-serif'
  });

  return (
    <MantineProvider theme={theme} >
      <BrowserRouter>
        <Router />
      </BrowserRouter>
    </MantineProvider>
  );
}

export default App;
