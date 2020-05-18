## Deno Playground 🦕

<p align="center"><img width="1216" alt="image" src="https://user-images.githubusercontent.com/491458/82177260-1ab14c00-9903-11ea-8119-8dfe2764a7c9.png"></p>

Deno playground scratchpad, inspired by golang's play.golang.org

Be aware that this will run unprevilleged code on your servers. For safety reasons, I'm adding a time-based execution limit (default is 3s, but can be overridden by setting `SCRIPT_EXECUTION_TIMEOUT` envvars).

## Available API routes

All results are in text format. HTTP response status indicates whether the request is completed successfully or not.

as always, 200 means OK - 500 means there's error somewhere in your code.

### POST /api/eval
Interpret deno source code, and get result back.
To use unstable features, pass `unstable=1` queryparams to the URL. To interpret as typescript, pass `typescript=1` queryparams to the URL.

```
curl -X POST \
'http://localhost:3000/api/eval' \
-H 'Content-Type: application/javascript' \
--data-raw 'console.log(Deno)'
```

### POST /api/fmt
Format deno source code, and get formatted result back.

```
curl -X POST \
'http://localhost:3000/api/fmt' \
-H 'Content-Type: application/javascript' \
--data-raw 'console.log(Deno)'
```

## Run in development mode

```bash
$ npx vercel dev
```

## Deploy to vercel

```
$ npx vercel
```