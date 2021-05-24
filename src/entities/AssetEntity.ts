import { GameEntity } from "./GameEntity";
import {
  Column,
  Entity,
  PrimaryColumn,
  OneToMany,
  ManyToOne,
  Index,
  ManyToMany,
} from "typeorm";
import { AssetHistoryEntity } from "./AssetHistoryEntity";
import { UserEntity } from "./UserEntity";
import { CollectionEntity } from "./CollectionEntity";

@Entity({ name: "assets" })
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
  @Column({ name: "collection_id", type: "varchar" })
  public collectionId?: string;

  @Column({ name: "content_id", type: "varchar" })
  public contentId?: string;

  @Column({ name: "create_time_stamp", type: "int" })
  public createTimestamp?: number;

  @Column({ name: "update_time_stamp", type: "int" })
  public updateTimestamp?: number;

  @ManyToOne(() => UserEntity, (user) => user.assets)
  public currentOwner?: UserEntity;

  @ManyToOne(() => UserEntity, (user) => user.assets)
  public creator?: UserEntity;

  @ManyToOne(() => GameEntity, (game) => game.assets)
  public game?: GameEntity;

  @OneToMany(() => AssetHistoryEntity, (history) => history.asset)
  public history?: AssetHistoryEntity[];

  @ManyToOne(() => CollectionEntity, (collection) => collection.assets)
  public collection?: CollectionEntity;

  @ManyToMany(() => UserEntity, (user: UserEntity) => user.likeAssets)
  public likers?: UserEntity[];

  constructor(
    opts: {
      id?: string;
      assetId?: string;
      assetURL?: string;
      gameId?: string;
      collectionId?: string;
      contentId?: string;
      createTimestamp?: number;
      updateTimestamp?: number;
      currentOwner?: UserEntity;
      creator?: UserEntity;
      game?: GameEntity;
      history?: AssetHistoryEntity[];
      collection?: CollectionEntity;
      likers?: UserEntity[];
    } = {}
  ) {
    this.id = opts.id;
    this.assetId = opts.assetId;
    this.assetURL = opts.assetURL;
    this.gameId = opts.gameId;
    this.collectionId = opts.collectionId;
    this.contentId = opts.contentId;
    this.createTimestamp = opts.createTimestamp;
    this.updateTimestamp = opts.updateTimestamp;
    this.currentOwner = opts.currentOwner;
    this.creator = opts.creator;
    this.game = opts.game;
    this.history = opts.history;
    this.collection = opts.collection;
    this.likers = opts.likers;
  }
}
