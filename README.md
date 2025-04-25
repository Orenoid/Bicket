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
npm install --legacy-peer-deps
```

3. **Generate Prisma client**

```bash
npx prisma generate
```

4. **Set up environment variables**

```bash
cp .env.example .env
```

Then modify the `.env` file as needed. You might need to create a new Clerk project and add the `CLERK_SECRET_KEY` and `CLERK_PUBLISHABLE_KEY` to the `.env` file.

5. **Start PostgreSQL with Docker Compose**

```bash
docker compose up -d
```

This will launch a PostgreSQL database container.

6. **Run Prisma migrations**

```bash
npx prisma migrate dev
```

7. **Start the development server**

```bash
npm run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000).

## Tech Stack

- TypeScript + Next.js + React
- Prisma (ORM)
- Tailwind CSS
- React Icons
- shadcn/ui
- PostgreSQL

## TODO

- Some Next.js hydration issues to be resolved, but they don't significantly affect usage
- Some UI components need to be replaced with shadcn/ui for consistent styling
- Improve tooltip and toast functionality to enhance interactive feedback
- Miners property needs to support scenarios with a large number of miners
- Some legacy code needs to be cleaned up and replaced with new implementation