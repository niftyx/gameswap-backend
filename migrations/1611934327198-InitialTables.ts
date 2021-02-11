import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialTables1611934327198 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "collections" ("id" character varying NOT NULL, "display_name" character varying NOT NULL, "description" character, "image_url" character varying NOT NULL, "short_url" character, PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE TABLE "games" ("id" character varying NOT NULL, "title" character varying NOT NULL, "description" character, "image_url" character varying NOT NULL, "categoryId" character, "version" character, "platform" character, "owner" character, PRIMARY KEY ("id"))`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "collections"`);
    await queryRunner.query(`DROP TABLE "games"`);
  }
}
