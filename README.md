# learn-frontend

react + vite website for the learn-backend api.

## files

- src/App.jsx          the whole page (form, upload preview, post list)
- vite.config.js       forwards /api and /uploads to the backend in dev
- deploy/nginx.conf    nginx config for the server later

## how it talks to the backend

the code calls /api/... with no domain. in dev, vite forwards it to
http://localhost:3001. on the server, nginx does the same. so the code
never changes between your mac and the server.

the backend must be running first.

## run locally

    npm install
    npm run dev

open http://localhost:5173

## build for production

    npm run build

this makes a dist/ folder of plain files. nginx serves those on the server.
