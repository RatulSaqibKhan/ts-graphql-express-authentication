import * as dotenv from 'dotenv';
import { Options } from "@mikro-orm/core";
import path from "path";
import { __prod__ } from "./constants";
import { User } from "./entities/User";

dotenv.config();

const config: Options = {
  migrations: {
    path: path.join(__dirname, './migrations'), // path to the folder with migrations
    pattern: /^[\w-]+\d+\.[tj]s$/, // regex pattern for the migration files
  },
  entities: [User],
  dbName: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  type: 'mysql',
  debug: !__prod__,
};

export default config;