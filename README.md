# PASS! — Fast-Paced Passing Game

A live multiplayer hot-potato game for phones.

## Rules
- 2–12 players join the same room.
- Each round gives the current holder an object/topic prompt.
- The holder types an answer, then passes the potato.
- The hidden timer is randomly 8–15 seconds.
- Whoever holds the potato when the timer expires receives 1 point.
- After 5 rounds, the lowest score wins.

## Run locally
```bash
npm install
npm run dev
```
Open http://localhost:5173. For two devices on the same Wi‑Fi, expose the app with your machine's LAN address or deploy the Node server.

## Deploy
Build with `npm run build`, then run `npm start`. Set `PORT` if your host provides one. The server uses Socket.IO for live room/game state.
# fastgame
