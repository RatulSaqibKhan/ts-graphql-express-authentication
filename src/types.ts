import { EntityManager, IDatabaseDriver, Connection } from "@mikro-orm/core";

export type DbContext = {
  em: EntityManager<any> & EntityManager<IDatabaseDriver<Connection>>
}