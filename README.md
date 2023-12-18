# Packstack

Packstack is a gear management system and packing list builder for backpackers and outdoor enthusiasts. The UI is built with React, Typescript and Vite.

### Getting started

First, set up your local env variables

Create `.env.local` and add the follow:

```
VITE_API_URL=https://api.packstack.io
VITE_SENTRY_DSN=
```

### Run the project locally

```
$ npm i
$ npm run dev
```

Log in with your credentials from [Packstack.io](https://app.packstack.io "Packstack's production server"). Feel free to create a test account, if needed.

_*Note:*_ Once the server is dockerized, documentation will be added for setting up the backend and database locally so that you don't need to use the production app for testing.
