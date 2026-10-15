import { readFile } from "node:fs/promises";
import { resolve, relative, sep } from "node:path";
import process from "node:process";
import pg from "pg";

const [migrationPath] = process.argv.slice(2);
if (!migrationPath) throw new Error("Provide a migration file path.");

const root = process.cwd();
const absolutePath = resolve(root, migrationPath);
const migrationsRoot = resolve(root, "supabase", "migrations") + sep;
if (!absolutePath.startsWith(migrationsRoot))
  throw new Error("Only files in supabase/migrations may be applied.");

const password = await new Promise((resolvePassword) => {
  let value = "";
  if (process.stdin.isTTY) process.stdin.setRawMode(true);
  process.stdin.setEncoding("utf8");
  process.stdin.resume();
  process.stdin.on("data", (chunk) => {
    for (const character of chunk) {
      if (character === "\r" || character === "\n") {
        if (process.stdin.isTTY) process.stdin.setRawMode(false);
        process.stdin.pause();
        resolvePassword(value.trim());
        return;
      }
      if (character === "\u0003") process.exit(130);
      if (character === "\b" || character === "\u007f")
        value = value.slice(0, -1);
      else value += character;
    }
  });
});
if (!password) throw new Error("Database password was not provided on stdin.");

const sql = await readFile(absolutePath, "utf8");
const client = new pg.Client({
  host: "aws-0-eu-west-1.pooler.supabase.com",
  port: 5432,
  database: "postgres",
  user: "postgres.wnyluitghrfgkxpbjdns",
  password,
  ssl: { rejectUnauthorized: true },
  connectionTimeoutMillis: 15_000,
});

try {
  await client.connect();
  await client.query("begin");
  await client.query(sql);
  await client.query("commit");
  console.log(`Applied ${relative(root, absolutePath)}.`);
} catch (error) {
  await client.query("rollback").catch(() => undefined);
  throw error;
} finally {
  await client.end().catch(() => undefined);
}
