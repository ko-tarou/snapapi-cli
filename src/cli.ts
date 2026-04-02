#!/usr/bin/env node
import * as fs from "node:fs";
import { createMockApi, formatResult } from "./api";
import { parseGenerateArgs, generateJson } from "./generate";

const VERSION = "1.0.0";

const HELP = `
\x1b[1msnapapi\x1b[0m - Create instant REST APIs from JSON

\x1b[1mUSAGE\x1b[0m
  snapapi create <file|json>     Create API from a JSON file or inline JSON
  snapapi create                 Create API from stdin (pipe JSON)
  snapapi generate [options]     Generate mock data and create API

\x1b[1mGENERATE OPTIONS\x1b[0m
  --resource <name>              Resource name (e.g. users)
  --count <n>                    Number of items (default: 10)
  --fields <spec>                Field definitions (e.g. "id:autoincrement,name:name,email:email")

\x1b[1mFIELD TYPES\x1b[0m
  autoincrement    Sequential integers (1, 2, 3, ...)
  name             Random full name
  email            Random email address
  boolean          Random true/false
  number           Random integer 0-999
  date             Random date (past year, YYYY-MM-DD)
  text             Random lorem ipsum text
  uuid             Random UUID v4

\x1b[1mEXAMPLES\x1b[0m
  npx snapapi create data.json
  npx snapapi create '{"users":[{"id":1,"name":"Alice"}]}'
  echo '{"users":[{"id":1}]}' | npx snapapi create
  npx snapapi generate --resource users --count 10 --fields "id:autoincrement,name:name,email:email"

\x1b[1mLINKS\x1b[0m
  Web:    https://snapapi.akokoa1221.workers.dev
  GitHub: https://github.com/ko-tarou/snapapi-cli
`;

function error(msg: string): never {
  console.error(`\x1b[31mError:\x1b[0m ${msg}`);
  process.exit(1);
}

async function readStdin(): Promise<string> {
  return new Promise((resolve, reject) => {
    let data = "";
    process.stdin.setEncoding("utf-8");
    process.stdin.on("data", (chunk) => (data += chunk));
    process.stdin.on("end", () => resolve(data.trim()));
    process.stdin.on("error", reject);

    // Timeout for stdin - if nothing comes in 100ms and stdin is a TTY, bail
    if (process.stdin.isTTY) {
      resolve("");
    }
  });
}

function resolveJson(arg?: string): Promise<string> | string {
  // Argument provided
  if (arg) {
    // If it looks like JSON (starts with { or [), use it directly
    if (arg.startsWith("{") || arg.startsWith("[")) {
      // Validate JSON
      try {
        JSON.parse(arg);
      } catch {
        error(`Invalid JSON: ${arg}`);
      }
      return arg;
    }

    // Otherwise treat as file path
    if (!fs.existsSync(arg)) {
      error(`File not found: ${arg}`);
    }
    const content = fs.readFileSync(arg, "utf-8").trim();
    try {
      JSON.parse(content);
    } catch {
      error(`Invalid JSON in file: ${arg}`);
    }
    return content;
  }

  // No argument - read from stdin
  return readStdin().then((data) => {
    if (!data) {
      error("No input provided. Pass a JSON file, inline JSON, or pipe data via stdin.");
    }
    try {
      JSON.parse(data);
    } catch {
      error("Invalid JSON from stdin.");
    }
    return data;
  });
}

async function handleCreate(args: string[]): Promise<void> {
  const json = await resolveJson(args[0]);

  if (!json) {
    error("No input provided. Pass a JSON file, inline JSON, or pipe data via stdin.");
  }

  const result = await createMockApi(json);
  console.log(formatResult(result));
}

async function handleGenerate(args: string[]): Promise<void> {
  const opts = parseGenerateArgs(args);
  const json = generateJson(opts);

  console.log(`\x1b[2mGenerated ${opts.count} ${opts.resource}...\x1b[0m`);

  const result = await createMockApi(json);
  console.log(formatResult(result));
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const command = args[0];

  switch (command) {
    case "create":
      await handleCreate(args.slice(1));
      break;
    case "generate":
      await handleGenerate(args.slice(1));
      break;
    case "version":
    case "--version":
    case "-v":
      console.log(`snapapi v${VERSION}`);
      break;
    case "help":
    case "--help":
    case "-h":
      console.log(HELP);
      break;
    default:
      console.log(HELP);
      break;
  }
}

main().catch((err: Error) => {
  error(err.message);
});
