# BomaHub Property Management System

A React frontend for the BomaHub property management system.

## Requirements

- Node.js 18+
- npm or yarn

## Setup

1. Install dependencies:

```bash
npm install
```

2. Configure the backend server:

The frontend is configured to connect to the backend at `/api` which is proxied to the Spring Boot server.

If you need to change the backend URL, edit the `vite.config.ts` file:

```typescript
server: {
  proxy: {
    '/api': {
      target: 'http://192.168.88.251:8080', // Change this to your backend URL
      changeOrigin: true,
      secure: false,
    }
  }
}
```

## Development

Start the development server:

```bash
npm run dev
```

This will start the development server with hot reload on [http://localhost:5173](http://localhost:5173).

## Project Structure

- `src/` - Source code
  - `assets/` - Static assets
  - `components/` - React components
  - `context/` - React context providers
  - `pages/` - Page components
  - `services/` - API services
  - `router.tsx` - Router configuration
  - `main.tsx` - Entry point

## Features

- Property management
- Unit management
- Tenant management
- User administration
- Authentication and authorization
