import { GameEntity } from "./GameEntity";
import { Column, Entity, PrimaryColumn, OneToMany, ManyToOne } from "typeorm";
import { AssetHistoryEntity } from "./AssetHistoryEntity";
import { AccountEntity } from "./AccountEntity";
import { CollectionEntity } from "./CollectionEntity";
import { ZeroXOrderEntity } from "./ZeroXOrderEntity";

@Entity({ name: "assets" })
export class AssetEntity {
  @PrimaryColumn({ name: "id", type: "varchar" })
  public id?: string;

  @Column({ name: "asset_id", type: "bigint" })
  public assetId?: string;

  @Column({ name: "asset_url", type: "varchar" })
  public assetURL?: string;

  @Column({ name: "game_id", type: "varchar" })
  public gameId?: string;

  @Column({ name: "category_id", type: "varchar" })
  public categoryId?: string;

  @Column({ name: "content_id", type: "varchar" })
  public contentId?: string;

  @ManyToOne(() => AccountEntity, (account) => account.assets)
  public currentOwner?: AccountEntity;

  @Column({ name: "created_time_stamp", type: "int" })
  public createTimeStamp?: number;

  @Column({ name: "updated_time_stamp", type: "int" })
  public updateTimeStamp?: number;

  @ManyToOne(() => GameEntity, (game) => game.assets)
  public game?: GameEntity;

  @OneToMany(() => AssetHistoryEntity, (history) => history.asset)
  public history?: AssetHistoryEntity[];

  @ManyToOne(() => CollectionEntity, (collection) => collection.assets)
  public collection?: CollectionEntity;

  @OneToMany(() => ZeroXOrderEntity, (order) => order.asset)
  public orders?: ZeroXOrderEntity[];

  constructor(
    opts: {
      id?: string;
      assetId?: string;
      assetURL?: string;
      gameId?: string;
      categoryId?: string;
      contentId?: string;
      currentOwner?: AccountEntity;
      createTimeStamp?: number;
      updateTimeStamp?: number;
      collection?: CollectionEntity;
      orders?: ZeroXOrderEntity[];
      history?: AssetHistoryEntity[];
      game?: GameEntity;
    } = {}
  ) {
    this.id = opts.id;
    this.assetId = opts.assetId;
    this.assetURL = opts.assetURL;
    this.gameId = opts.gameId;
    this.categoryId = opts.categoryId;
    this.contentId = opts.contentId;
    this.currentOwner = opts.currentOwner;
    this.createTimeStamp = opts.createTimeStamp;
    this.createTimeStamp = opts.createTimeStamp;
    this.updateTimeStamp = opts.updateTimeStamp;
    this.collection = opts.collection;
    this.orders = opts.orders;
    this.history = opts.history;
    this.game = opts.game;
  }
}
