# CS3219-AY22-23-Project-Skeleton

## Getting Started

### Install dependencies

In the root folder of the repository:

```sh
$ npm install
```

### Environment Variables

1. Make a copy `backend/.env.example` at `backend/.env`.

### Run the application

Start up the local development envrionment (frontend and backend only) by running:

```sh
$ npm run dev
```

Start up the local development environment (full infrastructure) by running:

```sh
$ npm run dev:full
```

The frontend should be served from http://localhost:3000 and the backend should be accessible from http://localhost:8080.

### Synchronizing the database

#### Creating migrations

Create a new migration file by running:

```sh
$ npm run on-backend migration:gen -- <name_of_migration>
```

#### Running existing migrations

Synchronize your database with existing migrations by running:

```sh
$ npm run on-backend migration:run
```

#### Updating the Prisma Client

Update the type definitions in the Prisma Client package by running:

```sh
$ npm run on-backend prisma:gen
```
