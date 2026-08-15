# Task Management Tool — Frontend

React (Vite) frontend for the Task Management Tool. Talks to the ASP.NET Core backend via JWT-authenticated REST calls and uses httpOnly cookies for authentication.

## Setup

```bash
npm install
```

Create a `.env` file (see `.env` example already in this folder) with:
```dotenv
VITE_API_BASE_URL=http://localhost:5223/api
```
Update the URL/port if your backend runs elsewhere.

## Development

```bash
npm run dev
```

Runs at `http://localhost:5173` by default. Requires the backend API to be running for login/data to work.

## Build

```bash
npm run build
```