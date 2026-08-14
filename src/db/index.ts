import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is required");
}

const globalForDb = globalThis as typeof globalThis & {
  __wadinaPostgresqlPool?: Pool;
};

export const pool =
  globalForDb.__wadinaPostgresqlPool ??
  new Pool({
    connectionString: databaseUrl,
    max: 3,
    min: 0,
    idleTimeoutMillis: 10000,
    connectionTimeoutMillis: 10000,
  });

if (process.env.NODE_ENV !== "production") {
  globalForDb.__wadinaPostgresqlPool = pool;
}

export const db = drizzle(pool);
