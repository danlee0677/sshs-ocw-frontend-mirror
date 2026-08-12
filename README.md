# .env configuration

You should create a .env file and have `VITE_API_URL` variable within.

```ini
VITE_API_URL = "http://localhost:PORT"
```

You can set the PORT in vite.config.ts:

```typescript
export default defineConfig({
  // some configs
  server: {
    port: 3000,
    // options
  },
  // some more configs
})
```