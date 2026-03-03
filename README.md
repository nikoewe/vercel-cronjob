# vercel-cronjob

Standalone cron job runner that reads `vercel.json` and replicates Vercel's cron behavior — scheduled HTTP GET requests with the same headers Vercel sends.

Useful for running Vercel cron jobs in environments where Vercel isn't handling scheduling (e.g., Kubernetes production deployments).

## Install

```bash
npm install vercel-cronjob
```

## Usage

```typescript
import { runCrons } from "vercel-cronjob";

runCrons({ url: "http://localhost:3000" });
```

With all options:

```typescript
runCrons({
  url: "http://localhost:3000",
  cronSecret: "my-secret",         // optional — sent as Authorization: Bearer <secret>
  vercelJsonPath: "./vercel.json",  // optional — defaults to ./vercel.json
});
```

## CLI

The package also ships a CLI that reads configuration from environment variables:

| Variable | Required | Description |
|----------|----------|-------------|
| `BASE_URL` | Yes | Target app URL |
| `CRON_SECRET` | No | Sent as `Authorization: Bearer <secret>` |
| `VERCEL_JSON_PATH` | No | Path to vercel.json (default: `./vercel.json`) |

```bash
BASE_URL=http://localhost:3000 npx vercel-cronjob
```

## License

MIT
