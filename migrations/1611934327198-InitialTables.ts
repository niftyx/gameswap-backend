import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialTables1611934327198 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "assets" ("id" character varying NOT NULL, "asset_id"  character varying NOT NULL, "asset_url" character NOT NULL, "game_id" character varying NOT NULL,"collection_id" character varying NOT NULL, "content_id" character varying NOT NULL, "create_time_stamp" integer NOT NULL, "update_time_stamp" integer NOT NULL, PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE TABLE "asset_histories" ("id" character varying NOT NULL, "tx_hash" character varying NOT NULL, "erc20" character NOT NULL, "erc20_amount"  character varying NOT NULL, "timestamp" integer NOT NULL, PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE TABLE "collections" ("id" character varying NOT NULL, "address" character varying NOT NULL, "name" character varying NOT NULL, "symbol" character varying NOT NULL, "image_url" character varying NOT NULL, "description" character, "total_supply"  character varying NOT NULL, "total_minted"  character varying NOT NULL, "total_burned"  character varying NOT NULL, "block" integer NOT NULL, "is_private" boolean NOT NULL,"is_verified" boolean NOT NULL,"is_premium" boolean NOT NULL,"is_featured" boolean NOT NULL,"game_ids" character varying NOT NULL , "create_time_stamp" integer NOT NULL, "update_time_stamp" integer NOT NULL, PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE TABLE "collection_histories" ("id" character varying NOT NULL, "timestamp" integer NOT NULL,"tx_hash" character varying NOT NULL, PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE TABLE "games" ("id" character varying NOT NULL, "name" character varying NOT NULL, "description" character, "image_url" character varying NOT NULL, "header_image_url" character, "custom_url" character, "category_id" character varying NOT NULL, "version" character, "platform" character varying NOT NULL,"is_verified" boolean NOT NULL,"is_premium" boolean NOT NULL,"is_featured" boolean NOT NULL,"create_time_stamp" integer NOT NULL,"update_time_stamp" integer NOT NULL, PRIMARY KEY ("id"))`
    );
    // tables for many-to-many relationship
    // game===collections
    await queryRunner.query(
      `CREATE TABLE "games_collections_relations" ("game_id"  character varying NOT NULL, "collection_id"  character varying NOT NULL, PRIMARY KEY ("game_id", "collection_id"))`
    );
    await queryRunner.query(
      `ALTER TABLE "games_collections_relations" ADD FOREIGN KEY ("game_id") REFERENCES "games"("id")`
    );
    await queryRunner.query(
      `ALTER TABLE "games_collections_relations" ADD FOREIGN KEY ("collection_id") REFERENCES "collections"("id")`
    );
    // game==users
    await queryRunner.query(
      `CREATE TABLE "games_followers" ("game_id"  character varying NOT NULL, "user_id"  character varying NOT NULL, PRIMARY KEY ("game_id", "user_id"))`
    );
    await queryRunner.query(
      `ALTER TABLE "games_followers" ADD FOREIGN KEY ("game_id") REFERENCES "games"("id")`
    );
    // assets==users
    await queryRunner.query(
      `CREATE TABLE "assets_likers" ("asset_id"  character varying NOT NULL, "user_id"  character varying NOT NULL, PRIMARY KEY ("asset_id", "user_id"))`
    );
    await queryRunner.query(
      `ALTER TABLE "assets_likers" ADD FOREIGN KEY ("asset_id") REFERENCES "assets"("id")`
    );
    // users===users
    await queryRunner.query(
      `CREATE TABLE "users_follow" ("follower_id"  character varying NOT NULL, "following_id"  character varying NOT NULL, PRIMARY KEY ("follower_id", "following_id"))`
    );

    await queryRunner.query(`ALTER TABLE "assets" ADD "owner_id" character`);
    await queryRunner.query(`ALTER TABLE "assets" ADD "creator_id" character`);
    await queryRunner.query(
      `ALTER TABLE "asset_histories" ADD "owner_id" character`
    );
    await queryRunner.query(
      `ALTER TABLE "collections" ADD "owner_id" character`
    );
    await queryRunner.query(`ALTER TABLE "games" ADD "owner_id" character`);

    // collections <= assets

    await queryRunner.query(
      `ALTER TABLE "assets" ADD FOREIGN KEY ("collection_id") REFERENCES "collections"("id")`
    );
    // assets <= asset_histories
    await queryRunner.query(
      `ALTER TABLE "asset_histories" ADD "asset_id" character`
    );
    await queryRunner.query(
      `ALTER TABLE "asset_histories" ADD FOREIGN KEY ("asset_id") REFERENCES "assets"("id")`
    );
    // collections <= collection_histories
    await queryRunner.query(
      `ALTER TABLE "collection_histories" ADD "collection_id" character`
    );
    await queryRunner.query(
      `ALTER TABLE "collection_histories" ADD FOREIGN KEY ("collection_id") REFERENCES "collections"("id")`
    );
    // games <= assets
    await queryRunner.query(
      `ALTER TABLE "assets" ADD FOREIGN KEY ("game_id") REFERENCES "games"("id")`
    );

    // user <= collection_histories
    await queryRunner.query(
      `ALTER TABLE "collection_histories" ADD "owner_id" character`
    );

    // create indexes
    // assets
    await queryRunner.query(
      `CREATE INDEX "assets_asset_idx" ON "assets"("asset_id")`
    );
    await queryRunner.query(
      `CREATE INDEX "assets_game_idx" ON "assets"("game_id")`
    );
    await queryRunner.query(
      `CREATE INDEX "assets_collection_idx" ON "assets"("collection_id")`
    );
    await queryRunner.query(
      `CREATE INDEX "assets_content_idx" ON "assets"("content_id")`
    );
    // games
    await queryRunner.query(
      `CREATE INDEX "games_category_idx" ON "games"("category_id")`
    );
    await queryRunner.query(
      `CREATE INDEX "games_custom_url_idx" ON "games"("custom_url")`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // LINK
    await queryRunner.query(`ALTER TABLE "assets" DROP COLUMN "game_id"`);

    await queryRunner.query(
      `ALTER TABLE "collection_histories" DROP COLUMN "collection_id"`
    );
    await queryRunner.query(
      `ALTER TABLE "asset_histories" DROP COLUMN "asset_id"`
    );
    await queryRunner.query(`ALTER TABLE "assets" DROP COLUMN "collection_id"`);

    await queryRunner.query(`ALTER TABLE "assets" DROP COLUMN "owner_id"`);
    await queryRunner.query(`ALTER TABLE "assets" DROP COLUMN "creator_id"`);
    await queryRunner.query(
      `ALTER TABLE "asset_histories" DROP COLUMN "owner_id"`
    );
    await queryRunner.query(`ALTER TABLE "collections" DROP COLUMN "owner_id"`);
    await queryRunner.query(`ALTER TABLE "games" DROP COLUMN "owner_id"`);

    // table
    await queryRunner.query(`DROP TABLE "games_collections_relations"`);
    await queryRunner.query(`DROP TABLE "games_followers"`);
    await queryRunner.query(`DROP TABLE "assets_likers"`);
    await queryRunner.query(`DROP TABLE "users_follow"`);
    await queryRunner.query(`DROP TABLE "asset_histories"`);
    await queryRunner.query(`DROP TABLE "games"`);
    await queryRunner.query(`DROP TABLE "assets"`);
    await queryRunner.query(`DROP TABLE "collection_histories"`);
    await queryRunner.query(`DROP TABLE "collections"`);
  }
}
