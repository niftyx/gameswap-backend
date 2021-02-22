import { ConnectionOptions } from "typeorm";

import { POSTGRES_READ_REPLICA_URIS, POSTGRES_URI } from "./config";
import {
  AssetEntity,
  AccountEntity,
  AssetHistoryEntity,
  CollectionEntity,
  CollectionHistoryEntity,
  GameEntity,
  ZeroXOrderEntity,
} from "./entities";

const entities = [
  AssetEntity,
  AccountEntity,
  AssetHistoryEntity,
  CollectionEntity,
  CollectionHistoryEntity,
  GameEntity,
  ZeroXOrderEntity,
  CollectionEntity,
];

const config: ConnectionOptions = {
  type: "postgres",
  entities,
  synchronize: true,
  logging: true,
  logger: "debug",
  extra: {
    max: 15,
    statement_timeout: 10000,
  },
  migrations: ["./lib/migrations/*.js"],
  ...(POSTGRES_READ_REPLICA_URIS
    ? {
        replication: {
          master: { url: POSTGRES_URI },
          slaves: POSTGRES_READ_REPLICA_URIS.map((r) => ({ url: r })),
        },
      }
    : { url: POSTGRES_URI }),
  cli: {
    migrationsDir: "./migrations",
  },
};

module.exports = config;
