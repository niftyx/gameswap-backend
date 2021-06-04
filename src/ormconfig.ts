import { ConnectionOptions } from "typeorm";

import { POSTGRES_URI } from "./config";

const config: ConnectionOptions = {
  type: "postgres",
  synchronize: true,
  logging: true,
  logger: "debug",
  extra: {
    max: 15,
    statement_timeout: 10000,
  },
  migrations: ["./lib/migrations/*.js"],
  url: POSTGRES_URI,
  cli: {
    migrationsDir: "./migrations",
  },
};

module.exports = config;
