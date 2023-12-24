# Packstack

Packstack is a gear management system and packing list builder for backpackers and outdoor enthusiasts. The UI is built with React, Typescript and Vite.

### Getting started

First, set up your local env variables

Create `.env.local` and add the follow:

```
VITE_API_URL=https://api.packstack.io
VITE_SENTRY_DSN=
```

### Start the development server

```
$ npm i
$ npm run dev
```

### Authentication

Until the server and database have been dockerized for local development, use your production credentials for authentication.

If you do not have a Packstack account, sign up at [Packstack.io](https://app.packstack.io "Packstack's production server"). Feel free to create a test account for local development.

_*Note:*_ Once the server is dockerized, documentation will be added for setting up the backend and database locally so that you don't need to use the production app for testing.
