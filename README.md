# Over Rentals website

Two separate apps:

| Folder      | What it is                                   | Default port |
| ----------- | -------------------------------------------- | ------------ |
| `backend/`  | Express API: contact form, live chat, email, newsletter | 5000 |
| `frontend/` | React + Vite website                         | 5173         |

The website sends every `/api/...` request to the backend address set in `frontend/.env` (`API_PROXY_TARGET`).

## First-time setup

```bash
cd backend  && npm install && cp .env.example .env   # then fill in EMAIL_USER, EMAIL_PASS, MAIL_TO
cd ../frontend && npm install && cp .env.example .env
```

## Run

Backend:

```bash
cd backend
npm run dev      # restarts on code changes (use `npm start` on a server)
```

Frontend (in a second terminal):

```bash
cd frontend
npm run dev                          # development
npm run build && npm run preview     # production build, served on FRONTEND_PORT
```

If the backend is not on port 5000 (for example because another app uses it), change `PORT` in
`backend/.env` and `API_PROXY_TARGET` in `frontend/.env` to the same port.

## Tests

```bash
cd backend && npm test
```
