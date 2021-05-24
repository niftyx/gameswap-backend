import { AssetEntity } from "./AssetEntity";
import {
  Column,
  Entity,
  PrimaryColumn,
  OneToMany,
  ManyToMany,
  JoinTable,
  ManyToOne,
} from "typeorm";
import { CollectionHistoryEntity } from "./CollectionHistoryEntity";
import { GameEntity } from "./GameEntity";
import { UserEntity } from "./UserEntity";
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

  @Column({ name: "total_supply", type: "varchar" })
  public totalSupply?: string;

  @Column({ name: "total_minted", type: "varchar" })
  public totalMinted?: string;

  @Column({ name: "total_burned", type: "varchar" })
  public totalBurned?: string;

  @Column({ name: "is_private", type: "boolean" })
  public isPrivate?: boolean;

  @Column({ name: "is_verified", type: "boolean" })
  public isVerified?: boolean;

  @Column({ name: "is_premium", type: "boolean" })
  public isPremium?: boolean;

  @Column({ name: "is_featured", type: "boolean" })
  public isFeatured?: boolean;

  @Column({ name: "create_time_stamp", type: "int" })
  public createTimestamp?: number;

  @Column({ name: "update_time_stamp", type: "int" })
  public updateTimestamp?: number;

  @ManyToOne(() => UserEntity, (user) => user.collections)
  public owner?: UserEntity;

  @OneToMany(() => AssetEntity, (asset) => asset.collection)
  public assets?: AssetEntity[];

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
      totalSupply?: string;
      totalMinted?: string;
      totalBurned?: string;
      block?: number;
      isPrivate?: boolean;
      isVerified?: boolean;
      isPremium?: boolean;
      isFeatured?: boolean;
      createTimestamp?: number;
      updateTimestamp?: number;
      owner?: UserEntity;
      assets?: AssetEntity[];
      history?: CollectionHistoryEntity[];
      games?: GameEntity[];
    } = {}
  ) {
    this.id = opts.id;
    this.address = opts.address;
    this.name = opts.name;
    this.symbol = opts.symbol;
    this.imageUrl = opts.imageUrl;
    this.description = opts.description;
    this.totalSupply = opts.totalSupply;
    this.totalMinted = opts.totalMinted;
    this.totalBurned = opts.totalBurned;
    this.block = opts.block;
    this.isPrivate = opts.isPrivate;
    this.isVerified = opts.isVerified;
    this.isPremium = opts.isPremium;
    this.isFeatured = opts.isFeatured;
    this.createTimestamp = opts.createTimestamp;
    this.updateTimestamp = opts.updateTimestamp;
    this.owner = opts.owner;
    this.assets = opts.assets;
    this.history = opts.history;

    this.games = opts.games;
  }
}
