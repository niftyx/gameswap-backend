import { AssetEntity } from "./AssetEntity";
import {
  Column,
  Entity,
  PrimaryColumn,
  OneToMany,
  ManyToMany,
  JoinTable,
} from "typeorm";
import { CollectionHistoryEntity } from "./CollectionHistoryEntity";
import { AssetHistoryEntity } from "./AssetHistoryEntity";
import { GameEntity } from "./GameEntity";
@Entity({ name: "collections" })
export class CollectionEntity {
  @PrimaryColumn({ name: "id", type: "varchar" })
  public id?: string;

  @Column({ name: "block", type: "int" })
  public block?: number;

  @Column({ name: "address", type: "varchar" })
  public address?: string;

  @Column({ name: "name", type: "varchar" })
  public name?: string;

  @Column({ name: "symbol", type: "varchar" })
  public symbol?: string;

  @Column({ name: "image_url", type: "varchar" })
  public imageUrl?: string;

  @Column({ name: "description", type: "varchar" })
  public description?: string;

  @Column({ name: "owner", type: "varchar" })
  public owner?: string;

  @Column({ name: "total_supply", type: "varchar" })
  public totalSupply?: string;

  @Column({ name: "total_minted", type: "varchar" })
  public totalMinted?: string;

  @Column({ name: "total_burned", type: "varchar" })
  public totalBurned?: string;

  @Column({ name: "game_ids", type: "varchar" })
  public gameIds?: string;

  @Column({ name: "is_private", type: "boolean" })
  public isPrivate?: boolean;

  @Column({ name: "is_verified", type: "boolean" })
  public isVerified?: boolean;

  @Column({ name: "is_premium", type: "boolean" })
  public isPremium?: boolean;

  @Column({ name: "is_featured", type: "boolean" })
  public isFeatured?: boolean;

  @OneToMany(() => AssetEntity, (asset) => asset.collection)
  public assets?: AssetEntity[];

  @Column({ name: "created_time_stamp", type: "int" })
  public createTimeStamp?: number;

  @Column({ name: "updated_time_stamp", type: "int" })
  public updateTimeStamp?: number;

  @OneToMany(() => CollectionHistoryEntity, (history) => history.collection)
  public history?: CollectionHistoryEntity[];

  @ManyToMany(() => GameEntity, (game: GameEntity) => game.collections)
  @JoinTable()
  public games?: GameEntity[];

  constructor(
    opts: {
      id?: string;
      address?: string;
      name?: string;
      symbol?: string;
      imageUrl?: string;
      description?: string;
      owner?: string;
      totalSupply?: string;
      totalMinted?: string;
      totalBurned?: string;
      createTimeStamp?: number;
      updateTimeStamp?: number;
      block?: number;
      isPrivate?: boolean;
      assets?: AssetEntity[];
      history?: AssetHistoryEntity[];
      isVerified?: boolean;
      isPremium?: boolean;
      isFeatured?: boolean;
      gameIds?: string;
      games?: GameEntity[];
    } = {}
  ) {
    this.id = opts.id;
    this.address = opts.address;
    this.name = opts.name;
    this.symbol = opts.symbol;
    this.imageUrl = opts.imageUrl;
    this.description = opts.description;
    this.owner = opts.owner;
    this.totalSupply = opts.totalSupply;
    this.totalMinted = opts.totalMinted;
    this.totalBurned = opts.totalBurned;
    this.createTimeStamp = opts.createTimeStamp;
    this.updateTimeStamp = opts.updateTimeStamp;
    this.block = opts.block;
    this.isPrivate = opts.isPrivate;
    this.assets = opts.assets;
    this.history = opts.history;
    this.isVerified = opts.isVerified;
    this.isPremium = opts.isPremium;
    this.isFeatured = opts.isFeatured;
    this.gameIds = opts.gameIds;
    this.games = opts.games;
  }
}
