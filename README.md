# snapapi

Create instant REST APIs from JSON. No signup required.

## Quick Start

```bash
npx snapapi create '{"users":[{"id":1,"name":"Alice"}]}'
```

## Commands

### Create from inline JSON

```bash
npx snapapi create '{"users":[{"id":1,"name":"Alice"}]}'
```

### Create from file

```bash
npx snapapi create data.json
```

### Create from stdin

```bash
echo '{"users":[{"id":1}]}' | npx snapapi create
cat data.json | npx snapapi create
```

### Generate mock data

```bash
npx snapapi generate --resource users --count 10 --fields "id:autoincrement,name:name,email:email"
```

#### Available field types

| Type | Description | Example |
|------|-------------|---------|
| `autoincrement` | Sequential integers | 1, 2, 3, ... |
| `name` | Random full name | Alice Smith |
| `email` | Random email | alice.smith@example.com |
| `boolean` | Random true/false | true |
| `number` | Random integer 0-999 | 42 |
| `date` | Random date (past year) | 2025-08-15 |
| `text` | Lorem ipsum text | lorem ipsum dolor... |
| `uuid` | Random UUID v4 | 550e8400-e29b... |

## Output

```
✓ Mock API created!

  Base URL:  https://snapapi.akokoa1221.workers.dev/api/mock/abc-123
  Webhook:   https://snapapi.akokoa1221.workers.dev/api/webhook/abc-123
  Docs:      https://snapapi.akokoa1221.workers.dev/docs/abc-123
  Endpoints: users

  Try it:
    curl https://snapapi.akokoa1221.workers.dev/api/mock/abc-123/users
```

## Requirements

- Node.js 18+

## Links

- [Web App](https://snapapi.akokoa1221.workers.dev)
- [GitHub](https://github.com/ko-tarou/snapapi-cli)

## License

MIT
