import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialTables1611934327198 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "accounts" ("id" character varying NOT NULL, "address" character varying NOT NULL,"name" character varying NOT NULL,"custom_url" character varying NOT NULL,"image_url" character varying NOT NULL, "bio" character varying NOT NULL, "twitter_username" character varying NOT NULL, "personal_site" character varying NOT NULL, "asset_count"  character varying NOT NULL, "create_time_stamp" integer NOT NULL, PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE TABLE "assets" ("id" character varying NOT NULL, "asset_id"  character varying NOT NULL, "asset_url" character NOT NULL, "game_id" character varying NOT NULL, "category_id" character varying NOT NULL, "content_id" character varying NOT NULL, "create_time_stamp" integer NOT NULL, "update_time_stamp" integer NOT NULL, PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE TABLE "asset_histories" ("id" character varying NOT NULL, "owner" character varying NOT NULL, "tx_hash" character varying NOT NULL, "erc20" character NOT NULL, "erc20_amount"  character varying NOT NULL, "timestamp" integer NOT NULL, PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE TABLE "collections" ("id" character varying NOT NULL, "address" character varying NOT NULL, "name" character varying NOT NULL, "symbol" character varying NOT NULL, "image_url" character varying NOT NULL, "description" character, "owner" character varying NOT NULL, "total_supply"  character varying NOT NULL, "total_minted"  character varying NOT NULL, "total_burned"  character varying NOT NULL, "block" integer NOT NULL, "create_time_stamp" integer NOT NULL, "update_time_stamp" integer NOT NULL, PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE TABLE "collection_histories" ("id" character varying NOT NULL, "owner" character varying NOT NULL, "timestamp" integer NOT NULL,"tx_hash" character varying NOT NULL, PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE TABLE "games" ("id" character varying NOT NULL, "name" character varying NOT NULL, "description" character, "image_url" character varying NOT NULL, "header_image_url" character, "categoryId" character varying NOT NULL, "version" character, "platform" character varying NOT NULL, "owner" character varying NOT NULL, PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE TABLE "zero_x_orders" ("hash" character varying NOT NULL, "sender_address" character varying NOT NULL, "maker_address" character varying NOT NULL, "taker_address" character varying NOT NULL, "maker_asset_data" character varying NOT NULL, "taker_asset_data" character varying NOT NULL, "exchange_address" character varying NOT NULL, "fee_recipient_address" character varying NOT NULL, "expiration_time_seconds" character varying NOT NULL, "maker_fee" character varying NOT NULL, "taker_fee" character varying NOT NULL, "maker_asset_amount" character varying NOT NULL, "taker_asset_amount" character varying NOT NULL, "salt" character varying NOT NULL, "signature" character varying NOT NULL, "remaining_fillable_taker_asset_amount" character varying NOT NULL, "maker_fee_asset_data" character varying NOT NULL, "taker_fee_asset_data" character varying NOT NULL, "status" character varying NOT NULL, PRIMARY KEY ("hash"))`
    );

    // INDEX
    await queryRunner.query(
      `CREATE INDEX "maker_address_idx" ON "zero_x_orders" ("maker_address") `
    );
    await queryRunner.query(
      `CREATE INDEX "taker_asset_data_idx" ON "zero_x_orders" ("taker_asset_data") `
    );
    await queryRunner.query(
      `CREATE INDEX "maker_asset_data_idx" ON "zero_x_orders" ("maker_asset_data") `
    );
    await queryRunner.query(
      `CREATE INDEX "maker_taker_asset_data_idx" ON "zero_x_orders" ("maker_asset_data", "taker_asset_data") `
    );
    await queryRunner.query(
      `CREATE INDEX "asset_id_idx" ON "assets" ("asset_id") `
    );
    await queryRunner.query(
      `CREATE INDEX "game_id_idx" ON "assets" ("game_id") `
    );
    await queryRunner.query(
      `CREATE INDEX "category_id_idx" ON "assets" ("category_id") `
    );
    await queryRunner.query(
      `CREATE INDEX "asset_category_id_idx" ON "assets" ("asset_id", "category_id") `
    );

    // LINK
    // accounts <= assets
    await queryRunner.query(
      `ALTER TABLE "assets" ADD "currentOwnerId" character`
    );
    await queryRunner.query(
      `ALTER TABLE "assets" ADD FOREIGN KEY ("currentOwnerId") REFERENCES "accounts"("id")`
    );
    // account (creator) <= assets
    await queryRunner.query(`ALTER TABLE "assets" ADD "creatorId" character`);
    await queryRunner.query(
      `ALTER TABLE "assets" ADD FOREIGN KEY ("creatorId") REFERENCES "accounts"("id")`
    );
    // collections <= assets
    await queryRunner.query(
      `ALTER TABLE "assets" ADD "collectionId" character`
    );
    await queryRunner.query(
      `ALTER TABLE "assets" ADD FOREIGN KEY ("collectionId") REFERENCES "collections"("id")`
    );
    // assets <= asset_histories
    await queryRunner.query(
      `ALTER TABLE "asset_histories" ADD "assetId" character`
    );
    await queryRunner.query(
      `ALTER TABLE "asset_histories" ADD FOREIGN KEY ("assetId") REFERENCES "assets"("id")`
    );
    // collections <= collection_histories
    await queryRunner.query(
      `ALTER TABLE "collection_histories" ADD "collectionId" character`
    );
    await queryRunner.query(
      `ALTER TABLE "collection_histories" ADD FOREIGN KEY ("collectionId") REFERENCES "collections"("id")`
    );
    // assets <= zero_x_orders
    await queryRunner.query(
      `ALTER TABLE "zero_x_orders" ADD "assetId" character`
    );
    await queryRunner.query(
      `ALTER TABLE "zero_x_orders" ADD FOREIGN KEY ("assetId") REFERENCES "assets"("id")`
    );
    // games <= assets
    await queryRunner.query(`ALTER TABLE "assets" ADD "gameId" character`);
    await queryRunner.query(
      `ALTER TABLE "assets" ADD FOREIGN KEY ("gameId") REFERENCES "games"("id")`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // LINK
    await queryRunner.query(`ALTER TABLE "assets" DROP COLUMN "gameId"`);
    await queryRunner.query(
      `ALTER TABLE "zero_x_orders" DROP COLUMN "assetId"`
    );
    await queryRunner.query(
      `ALTER TABLE "collection_histories" DROP COLUMN "collectionId"`
    );
    await queryRunner.query(
      `ALTER TABLE "asset_histories" DROP COLUMN "assetId"`
    );
    await queryRunner.query(`ALTER TABLE "assets" DROP COLUMN "collectionId"`);
    await queryRunner.query(`ALTER TABLE "assets" DROP COLUMN "creatorId"`);
    await queryRunner.query(
      `ALTER TABLE "assets" DROP COLUMN "currentOwnerId"`
    );
    // INDEX
    await queryRunner.query(`DROP INDEX "asset_category_id_idx"`);
    await queryRunner.query(`DROP INDEX "category_id_idx"`);
    await queryRunner.query(`DROP INDEX "game_id_idx"`);
    await queryRunner.query(`DROP INDEX "asset_id_idx"`);
    await queryRunner.query(`DROP INDEX "maker_taker_asset_data_idx"`);
    await queryRunner.query(`DROP INDEX "maker_asset_data_idx"`);
    await queryRunner.query(`DROP INDEX "taker_asset_data_idx"`);
    await queryRunner.query(`DROP INDEX "maker_address_idx"`);
    // table
    await queryRunner.query(`DROP TABLE "accounts"`);
    await queryRunner.query(`DROP TABLE "asset_histories"`);
    await queryRunner.query(`DROP TABLE "zero_x_orders"`);
    await queryRunner.query(`DROP TABLE "games"`);
    await queryRunner.query(`DROP TABLE "assets"`);
    await queryRunner.query(`DROP TABLE "collection_histories"`);
    await queryRunner.query(`DROP TABLE "collections"`);
  }
}
