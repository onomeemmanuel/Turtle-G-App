Deploying to Render

This repo includes two services defined in `render.yaml`:

- Backend: Node web service (folder: `Backend`) — uses `npm start`.
- Frontend: Static site (folder: `Frontend`) — built with `npm run build` and publishes `Frontend/dist`.

Steps to deploy:

1. Push these files to your Git remote (main branch). Example:

```bash
git add render.yaml DEPLOY_RENDER.md
git commit -m "Add Render manifest and deployment docs"
git push origin main
```

2. On Render dashboard, create a new service by connecting your GitHub/GitLab repo and select `render.yaml` manifest for automatic creation. Alternatively create two services manually:

- Backend service (Web Service, Node):
  - Build Command: `cd Backend && npm install`
  - Start Command: `cd Backend && npm start`
  - Environment Variables: set `MONGO_URI`, `PORT`, `JWT_SECRET` in Render dashboard

- Frontend service (Static Site):
  - Build Command: `cd Frontend && npm install && npm run build`
  - Publish directory: `Frontend/dist`

3. Set environment variables in the Render dashboard for the Backend service (`MONGO_URI`, `JWT_SECRET`, optional `PORT`).

4. Deploy and monitor logs on Render. If you need HTTPS origins or CORS edits, update `Backend/src/index.js` accordingly.

If you want, I can commit and push these changes for you now (requires your local Git credentials).