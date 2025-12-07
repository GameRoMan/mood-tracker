import config from "../../config.json" assert { type: "json" };
import { readFile } from "node:fs/promises";
import * as pg from "pg";

export const pool = new pg.Pool(config.database);

export async function exec$(
  query: string,
  values: unknown[] = [],
): Promise<any[]> {
  return (await pool.query(query, values)).rows;
}

export async function fetch$(query: string, values: unknown[] = []) {
  return (await exec$(query, values))[0];
}

export async function initDatabase() {
  await exec$(await readFile("data/setup.psql", "utf-8"));
}
