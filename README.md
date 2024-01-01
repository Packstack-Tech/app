# Packstack

Packstack is a gear management system and packing list builder for backpackers and outdoor enthusiasts. The UI is built with React, Typescript and Vite.

### Getting started

First, set up your local env variables.

Create `.env.local` and add the following:

```
VITE_API_URL=http://localhost # OR https://api.packstack.io
VITE_SENTRY_DSN=
```

### Start the frontend server

From the project root, run:

```
$ npm i
$ npm run dev
```

### (Option 1) Run the API & database locally

If you want to set up the API and database locally, follow the instructions on the [API server repo](https://github.com/Packstack-Tech/packstack-api).

### (Option 2) Use the production server

If you do NOT want to run the API and database locally, you can sign in using your credential from [Packstack.io](https://app.packstack.io).

In `.env.local`, change the value of `VITE_API_URL` to `https://api.packstack.io`

If you do not have a Packstack account, sign up at [Packstack.io](https://app.packstack.io "Packstack's production app"). Feel free to create a test account for local development.
