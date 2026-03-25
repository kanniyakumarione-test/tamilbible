# Tamil Bible Backend

Separate backend for the Tamil Bible presentation features.

## Local run

```bash
npm start
```

Runs on port `8787` by default.

## Render

- Root Directory: `backend`
- Build Command: `npm install`
- Start Command: `npm start`

Optional environment variables:

- `PORT`
- `HOST`
- `ALLOWED_ORIGIN`

## Frontend

Point the frontend to this backend with:

```env
VITE_PRESENTATION_API_BASE=https://your-render-service.onrender.com
```
