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
      `CREATE TABLE "collections" ("id" character varying NOT NULL, "address" character varying NOT NULL UNIQUE, "name" character varying NOT NULL, "symbol" character varying NOT NULL, "image_url" character varying NOT NULL, "description" character, "total_supply"  character varying NOT NULL, "total_minted"  character varying NOT NULL, "total_burned"  character varying NOT NULL, "block" integer NOT NULL, "is_private" boolean NOT NULL,"is_verified" boolean NOT NULL,"is_premium" boolean NOT NULL,"is_featured" boolean NOT NULL,"game_ids" character varying NOT NULL , "create_time_stamp" integer NOT NULL, "update_time_stamp" integer NOT NULL, PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE TABLE "collection_histories" ("id" character varying NOT NULL, "timestamp" integer NOT NULL,"tx_hash" character varying NOT NULL, PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE TABLE "games" ("id" character varying NOT NULL, "name" character varying NOT NULL, "description" character, "image_url" character varying NOT NULL, "header_image_url" character, "custom_url" character, "category_id" character varying NOT NULL, "version" character, "platform" character varying NOT NULL,"is_verified" boolean NOT NULL,"is_premium" boolean NOT NULL,"is_featured" boolean NOT NULL,"create_time_stamp" integer NOT NULL,"update_time_stamp" integer NOT NULL, PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE TABLE "users" ("id" character varying NOT NULL, "address" character varying NOT NULL UNIQUE, "name" character varying NOT NULL, "custom_url" character varying NOT NULL, "image_url" character varying NOT NULL, "header_image_url" character varying NOT NULL, "bio" character varying NOT NULL, "twitter_username" character varying NOT NULL, "twitter_verified" boolean NOT NULL, "twitch_username" character varying NOT NULL, "facebook_username" character varying NOT NULL, "youtube_username" character varying NOT NULL, "instagram_username" character varying NOT NULL, "tiktok_username" character varying NOT NULL,"personal_site" character varying NOT NULL,"create_time_stamp" integer NOT NULL,"update_time_stamp" integer NOT NULL,PRIMARY KEY ("id"))`
    );

    // verbs
    await queryRunner.query(
      `CREATE TABLE "verbs" ("id" SERIAL, "name" character varying NOT NULL UNIQUE, PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `INSERT INTO "verbs"("name") VALUES('FOLLOW'), ('LIKE'), ('CREATE') ON CONFLICT DO NOTHING`
    );

    // objects
    await queryRunner.query(
      `CREATE TABLE "objects" ("id" SERIAL, "user_id" character varying,"game_id" character varying,"collection_id" character varying,"asset_id" character varying, PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `ALTER TABLE "objects" ADD FOREIGN KEY ("user_id") REFERENCES "users"("id")`
    );
    await queryRunner.query(
      `ALTER TABLE "objects" ADD FOREIGN KEY ("game_id") REFERENCES "games"("id")`
    );
    await queryRunner.query(
      `ALTER TABLE "objects" ADD FOREIGN KEY ("collection_id") REFERENCES "collections"("id")`
    );
    await queryRunner.query(
      `ALTER TABLE "objects" ADD FOREIGN KEY ("asset_id") REFERENCES "assets"("id")`
    );
    // activities
    await queryRunner.query(
      `CREATE TABLE "activities" ("id" SERIAL, "user_id" character varying NOT NULL,"verb_id" integer NOT NULL,"object_id" integer NOT NULL,"timestamp" integer NOT NULL, PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `ALTER TABLE "activities" ADD FOREIGN KEY ("user_id") REFERENCES "users"("id")`
    );
    await queryRunner.query(
      `ALTER TABLE "activities" ADD FOREIGN KEY ("verb_id") REFERENCES "verbs"("id")`
    );
    await queryRunner.query(
      `ALTER TABLE "activities" ADD FOREIGN KEY ("object_id") REFERENCES "objects"("id")`
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
      `CREATE TABLE "games_followers" ("game_id"  character varying NOT NULL, "user_id"  text NOT NULL, PRIMARY KEY ("game_id", "user_id"))`
    );
    await queryRunner.query(
      `ALTER TABLE "games_followers" ADD FOREIGN KEY ("game_id") REFERENCES "games"("id")`
    );
    await queryRunner.query(
      `ALTER TABLE "games_followers" ADD FOREIGN KEY ("user_id") REFERENCES "users"("id")`
    );
    // assets==users
    await queryRunner.query(
      `CREATE TABLE "assets_likers" ("asset_id"  character varying NOT NULL, "user_id"  text NOT NULL, PRIMARY KEY ("asset_id", "user_id"))`
    );
    await queryRunner.query(
      `ALTER TABLE "assets_likers" ADD FOREIGN KEY ("asset_id") REFERENCES "assets"("id")`
    );
    await queryRunner.query(
      `ALTER TABLE "assets_likers" ADD FOREIGN KEY ("user_id") REFERENCES "users"("id")`
    );
    // users===users
    await queryRunner.query(
      `CREATE TABLE "users_follow" ("follower_id"  text NOT NULL, "following_id" text NOT NULL, PRIMARY KEY ("follower_id", "following_id"))`
    );
    await queryRunner.query(
      `ALTER TABLE "users_follow" ADD FOREIGN KEY ("follower_id") REFERENCES "users"("id")`
    );
    await queryRunner.query(
      `ALTER TABLE "users_follow" ADD FOREIGN KEY ("following_id") REFERENCES "users"("id")`
    );

    // assets(owner) <=> users
    await queryRunner.query(
      `ALTER TABLE "assets" ADD "owner_id" text NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "assets" ADD FOREIGN KEY ("owner_id") REFERENCES "users"("id")`
    );
    // assets(creator) <=> users
    await queryRunner.query(
      `ALTER TABLE "assets" ADD "creator_id" text NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "assets" ADD FOREIGN KEY ("creator_id") REFERENCES "users"("id")`
    );
    // asset_histories(owner) <=> users
    await queryRunner.query(
      `ALTER TABLE "asset_histories" ADD "owner_id" text NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "asset_histories" ADD FOREIGN KEY ("owner_id") REFERENCES "users"("id")`
    );
    // collections(owner) <=> users
    await queryRunner.query(
      `ALTER TABLE "collections" ADD "owner_id" text NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "collections" ADD FOREIGN KEY ("owner_id") REFERENCES "users"("id")`
    );
    // games(owner) <=> users
    await queryRunner.query(`ALTER TABLE "games" ADD "owner_id" text NOT NULL`);
    await queryRunner.query(
      `ALTER TABLE "games" ADD FOREIGN KEY ("owner_id") REFERENCES "users"("id")`
    );

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
      `ALTER TABLE "collection_histories" ADD "owner_id" text NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "collection_histories" ADD FOREIGN KEY ("owner_id") REFERENCES "users"("id")`
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
    // users
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "users_custom_url_idx" ON "users"("custom_url")`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // DROP INDEX
    await queryRunner.query(`DROP INDEX "users_custom_url_idx"`);
    await queryRunner.query(`DROP INDEX "games_custom_url_idx"`);
    await queryRunner.query(`DROP INDEX "games_category_idx"`);
    await queryRunner.query(`DROP INDEX "assets_content_idx"`);
    await queryRunner.query(`DROP INDEX "assets_collection_idx"`);
    await queryRunner.query(`DROP INDEX "assets_game_idx"`);
    await queryRunner.query(`DROP INDEX "assets_asset_idx"`);

    // table
    await queryRunner.query(`DROP TABLE "activities"`);
    await queryRunner.query(`DROP TABLE "objects"`);
    await queryRunner.query(`DROP TABLE "verbs"`);
    await queryRunner.query(`DROP TABLE "users_follow"`);
    await queryRunner.query(`DROP TABLE "assets_likers"`);
    await queryRunner.query(`DROP TABLE "games_followers"`);
    await queryRunner.query(`DROP TABLE "games_collections_relations"`);

    await queryRunner.query(`DROP TABLE "asset_histories"`);
    await queryRunner.query(`DROP TABLE "collection_histories"`);
    await queryRunner.query(`DROP TABLE "assets"`);
    await queryRunner.query(`DROP TABLE "collections"`);
    await queryRunner.query(`DROP TABLE "games"`);
    await queryRunner.query(`DROP TABLE "users"`);
  }
}
