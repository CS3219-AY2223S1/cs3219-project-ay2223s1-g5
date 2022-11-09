import { Prisma, PrismaClient } from "@prisma/client";

export class TestClient extends PrismaClient {
  async reset() {
    const tables = (await this.$queryRaw(Prisma.sql`SELECT table_name
      FROM information_schema.tables
      WHERE table_schema='public'
      AND table_type='BASE TABLE';`)) as { table_name: string }[];

    for (const table of tables) {
      if (table.table_name === "_prisma_migrations") {
        continue;
      }
      await this.$executeRawUnsafe(
        `TRUNCATE TABLE "${table.table_name}" RESTART IDENTITY CASCADE;`,
      );
    }
  }
}
