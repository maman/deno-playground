## Deno Playground

Deno playground scratchpad, inspired by golang's play.golang.org

Not yet feature-complete, only available as API endpoints for now.

### Available API routes

##### POST /api/eval
Interpret deno source code, and get result back.
To use unstable features, pass `unstable=1` queryparams on the URL.

```
curl -X POST \
'http://localhost:3000/api/eval' \
-H 'Content-Type: application/javascript' \
--data-raw 'console.log(Deno)'
```

##### `<BASE_URL>/api/fmt`
Format deno source code, and get formatted result back.

```
curl -X POST \
'http://localhost:3000/api/fmt' \
-H 'Content-Type: application/javascript' \
--data-raw 'console.log(Deno)'
```

### Run in development mode

```bash
$ npx vercel dev
```

### Deploy to vercel

```
$ npx vercel
```