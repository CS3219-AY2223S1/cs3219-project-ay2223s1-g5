# CS3219-AY22-23-Project-Skeleton


## Getting Started

### Install dependencies

In the root folder of the repository:
```sh
$ npm install
```

### Environment Variables

1. Make a copy `backend/.env.example` at `backend/.env`.

2. If using docker-compose to provision the development environment, copy `backend/.env` to `.env` in the root folder.

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