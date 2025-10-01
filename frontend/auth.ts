
import "dotenv/config";

import { betterAuth } from "better-auth";
import { MssqlDialect } from "kysely";
import * as Tedious from "tedious";
import * as Tarn from "tarn";

function req(name: string, def?: string) {
  const v = process.env[name] ?? def;
  if (!v) throw new Error(`Missing required env: ${name}`);
  return v;
}

const DB_HOST = req("DB_HOST", "localhost");
const DB_PORT = Number(process.env.DB_PORT ?? 1433);
const DB_NAME = req("DB_NAME", "Bidforge");
const DB_USER = req("DB_USER");
const DB_PASSWORD = req("DB_PASSWORD");

console.log(`[BetterAuth CLI] DB -> host=${DB_HOST} port=${DB_PORT} db=${DB_NAME} user=${DB_USER}`);

const dialect = new MssqlDialect({
  tarn: { ...Tarn, options: { min: 0, max: 3 } },
  tedious: {
    ...Tedious,
    connectionFactory: () =>
      new Tedious.Connection({
        server: DB_HOST, 
        options: {
          database: DB_NAME,
          port: DB_PORT,
          trustServerCertificate: true, 
        },
        authentication: {
          type: "default",
          options: {
            userName: DB_USER,
            password: DB_PASSWORD,
          },
        },
      }),
  },
});

export default betterAuth({
  baseURL: req("BETTER_AUTH_URL", "http://localhost:3000"),
  secret: req("BETTER_AUTH_SECRET"),
  database: { dialect, type: "mssql" },
  emailAndPassword: true,
});
