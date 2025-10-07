import { betterAuth } from "better-auth";
import { MssqlDialect } from "kysely";
import * as Tedious from "tedious";
import * as Tarn from "tarn";

const dialect = new MssqlDialect({
  tarn: { ...Tarn, options: { min: 0, max: 10 } },
  tedious: {
    ...Tedious,
    connectionFactory: () =>
      new Tedious.Connection({
        server: process.env.DB_HOST ?? "localhost",
        options: {
          database: process.env.DB_NAME ?? "Bidforge",
          port: +(process.env.DB_PORT ?? "1433"),
          trustServerCertificate: true,
          // `schema` is not a valid property on Tedious Connection options; remove or handle via queries
        },
        authentication: {
          type: "default",
          options: {
            userName: process.env.DB_USER ?? "chathura",
            password: process.env.DB_PASSWORD ?? "7895123",
          },
        },
      }),
  },
});

export const auth = betterAuth({
  database: {
    dialect,
    type: "mssql",
  },
  emailAndPassword: { enabled: true },
  // plugins: [nextCookies()], // enable if your installed `better-auth` exposes nextCookies
});
