# Turtle-G App

A student-focused social marketplace app built with React, Node.js, Express, and MongoDB.

## Features
- Login/signup with JWT authentication
- Student profiles with followers/following
- Feed with posts, likes, comments, reels, and marketplace listings
- Messaging only between users you follow
- Sections for Home, Profile, Reels, Marketplace, Settings, Past Questions, and News
- Smooth UI animations using `framer-motion`

## Setup

### Single repo setup
1. `npm install`
2. Copy `Backend/.env.example` to `Backend/.env` and set your MongoDB connection
3. `npm run build`
4. `npm start`

### Local development
1. `cd Backend`
2. `npm install`
3. `npm run dev`

## Notes
- The backend serves the built frontend from `Frontend/dist`
- On production, use the root repo commands above so the app runs as a single service
- Add real media upload and messaging UX as the next step
