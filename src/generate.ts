interface GenerateOptions {
  resource: string;
  count: number;
  fields: Field[];
}

interface Field {
  name: string;
  type: string;
}

const FIRST_NAMES = [
  "Alice", "Bob", "Charlie", "Diana", "Eve", "Frank", "Grace", "Hank",
  "Ivy", "Jack", "Karen", "Leo", "Mia", "Noah", "Olivia", "Paul",
];

const LAST_NAMES = [
  "Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller",
  "Davis", "Rodriguez", "Martinez", "Hernandez", "Lopez", "Wilson", "Anderson",
];

const DOMAINS = ["example.com", "test.org", "demo.net", "sample.io"];

const LOREM_WORDS = [
  "lorem", "ipsum", "dolor", "sit", "amet", "consectetur", "adipiscing",
  "elit", "sed", "do", "eiusmod", "tempor", "incididunt", "ut", "labore",
  "et", "dolore", "magna", "aliqua",
];

function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateValue(type: string, index: number): unknown {
  switch (type) {
    case "autoincrement":
      return index + 1;
    case "name":
      return `${randomItem(FIRST_NAMES)} ${randomItem(LAST_NAMES)}`;
    case "email": {
      const first = randomItem(FIRST_NAMES).toLowerCase();
      const last = randomItem(LAST_NAMES).toLowerCase();
      return `${first}.${last}@${randomItem(DOMAINS)}`;
    }
    case "boolean":
      return Math.random() > 0.5;
    case "number":
      return Math.floor(Math.random() * 1000);
    case "date":
      return new Date(
        Date.now() - Math.floor(Math.random() * 365 * 24 * 60 * 60 * 1000)
      ).toISOString().split("T")[0];
    case "text":
      return Array.from({ length: 5 + Math.floor(Math.random() * 10) }, () =>
        randomItem(LOREM_WORDS)
      ).join(" ");
    case "uuid":
      return crypto.randomUUID();
    default:
      return `${type}_${index + 1}`;
  }
}

export function parseFields(fieldsStr: string): Field[] {
  return fieldsStr.split(",").map((f) => {
    const [name, type] = f.trim().split(":");
    if (!name || !type) {
      throw new Error(
        `Invalid field format: "${f.trim()}". Expected "name:type".`
      );
    }
    return { name: name.trim(), type: type.trim() };
  });
}

export function parseGenerateArgs(args: string[]): GenerateOptions {
  let resource = "";
  let count = 10;
  let fields: Field[] = [];

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case "--resource":
        resource = args[++i] || "";
        break;
      case "--count":
        count = parseInt(args[++i] || "10", 10);
        break;
      case "--fields":
        fields = parseFields(args[++i] || "");
        break;
    }
  }

  if (!resource) {
    throw new Error("--resource is required for generate command.");
  }
  if (fields.length === 0) {
    throw new Error("--fields is required for generate command.");
  }
  if (isNaN(count) || count < 1) {
    throw new Error("--count must be a positive number.");
  }

  return { resource, count, fields };
}

export function generateJson(opts: GenerateOptions): string {
  const items = Array.from({ length: opts.count }, (_, i) => {
    const obj: Record<string, unknown> = {};
    for (const field of opts.fields) {
      obj[field.name] = generateValue(field.type, i);
    }
    return obj;
  });

  return JSON.stringify({ [opts.resource]: items });
}
