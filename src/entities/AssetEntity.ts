import { GameEntity } from "./GameEntity";
import {
  Column,
  Entity,
  PrimaryColumn,
  OneToMany,
  ManyToOne,
  Index,
} from "typeorm";
import { AssetHistoryEntity } from "./AssetHistoryEntity";
import { AccountEntity } from "./AccountEntity";
import { CollectionEntity } from "./CollectionEntity";

@Entity({ name: "assets" })
@Index("asset_category_id_idx", ["assetId", "categoryId"])
export class AssetEntity {
  @PrimaryColumn({ name: "id", type: "varchar" })
  public id?: string;

  @Index("asset_id_idx")
  @Column({ name: "asset_id", type: "varchar" })
  public assetId?: string;

  @Column({ name: "asset_url", type: "varchar" })
  public assetURL?: string;

  @Index("game_id_idx")
  @Column({ name: "game_id", type: "varchar" })
  public gameId?: string;

  @Index("category_id_idx")
  @Column({ name: "category_id", type: "varchar" })
  public categoryId?: string;

  @Column({ name: "content_id", type: "varchar" })
  public contentId?: string;

  @ManyToOne(() => AccountEntity, (account) => account.assets)
  public currentOwner?: AccountEntity;

  @ManyToOne(() => AccountEntity, (account) => account.assets)
  public creator?: AccountEntity;

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

  constructor(
    opts: {
      id?: string;
      assetId?: string;
      assetURL?: string;
      gameId?: string;
      categoryId?: string;
      contentId?: string;
      currentOwner?: AccountEntity;
      creator?: AccountEntity;
      createTimeStamp?: number;
      updateTimeStamp?: number;
      collection?: CollectionEntity;
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
    this.history = opts.history;
    this.game = opts.game;
    this.creator = opts.creator;
  }
}
