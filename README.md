# Bicket

Bicket is a simple, lightweight ticket management system similar to Jira. It helps teams track issues, manage tasks, and organize their workflow efficiently.

## Features

- Issue tracking and management
- Customizable properties and property values
- Integrated Clerk authentication system for secure user management

## Local Development

### Prerequisites

- Node.js (v18 or newer)
- npm or yarn
- Docker and Docker Compose

### Setup Steps

1. **Clone the repository**

```bash
git clone https://github.com/yourusername/bicket.git
cd bicket
```

2. **Install dependencies**

```bash
npm install
# or
yarn install
```

3. **Generate Prisma client**

```bash
npx prisma generate
```

4. **Set up environment variables**

```bash
cp .env.example .env
```

Then modify the `.env` file as needed.

5. **Start PostgreSQL with Docker Compose**

```bash
docker compose up -d
```

This will launch a PostgreSQL database container.

6. **Start the development server**

```bash
npm run dev
# or
yarn dev
```

The application will be available at [http://localhost:3000](http://localhost:3000).

## Tech Stack

- TypeScript
- Next.js
- React
- Prisma (ORM)
- PostgreSQL
- Tailwind CSS
- React Icons
