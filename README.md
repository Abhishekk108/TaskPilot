# TodoAgent

A CLI-based todo management application powered by AI, built with Node.js and PostgreSQL.

## Overview

TodoAgent provides intelligent todo management with AI capabilities integrated through the Groq API. Manage tasks with natural language processing and database persistence.

## Features

- Create, read, update, and delete todos
- Search todos with pattern matching
- AI-powered todo management
- PostgreSQL database integration
- Database migrations with Drizzle ORM

## Prerequisites

- Node.js 18+
- Docker and Docker Compose
- GROQ_API_KEY environment variable

## Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd TodoAgent
```

2. Install dependencies:

```bash
npm install
```

3. Set up environment variables:
   Create a `.env` file in the project root:

```
GROQ_API_KEY=your_groq_api_key_here
```

## Setup

1. Start the PostgreSQL database:

```bash
docker-compose up -d
```

2. Generate and run database migrations:

```bash
npm run generate
npm run migrate
```

3. (Optional) Open Drizzle Studio for database management:

```bash
npm run studio
```

## Usage

Run the application:

```bash
node index.js
```

## Database

The project uses Drizzle ORM with PostgreSQL. Database schema is defined in `db/schema.js`.

### Available Scripts

- `npm run generate` - Generate database migrations
- `npm run migrate` - Run database migrations
- `npm run studio` - Open Drizzle Studio

## Project Structure

```
├── index.js              # Main application entry point
├── package.json          # Project dependencies
├── docker-compose.yaml   # PostgreSQL configuration
├── drizzle.config.js     # Drizzle ORM configuration
├── db/
│   ├── index.js         # Database connection
│   └── schema.js        # Database schema definitions
└── drizzle/             # Database migrations
```

## License

ISC
