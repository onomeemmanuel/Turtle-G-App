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

### Backend
1. `cd Backend`
2. `npm install`
3. Copy `.env.example` to `.env` and set your MongoDB connection
4. `npm run dev`

### Frontend
1. `cd Frontend`
2. `npm install`
3. `npm run dev`

## Notes
- The frontend proxies `/api` to `http://localhost:5000`
- Add real media upload and messaging UX as the next step
