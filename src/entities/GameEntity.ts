import {
  Column,
  Entity,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryColumn,
} from "typeorm";
import { AssetEntity } from "./AssetEntity";
import { CollectionEntity } from "./CollectionEntity";
import { UserEntity } from "./UserEntity";

@Entity({ name: "games" })
export class GameEntity {
  @PrimaryColumn({ name: "id", type: "varchar" })
  public id?: string;

  @Column({ name: "name", type: "varchar" })
  public name?: string;

  @Column({ name: "custom_url", type: "varchar" })
  public customUrl?: string;

  @Column({ name: "version", type: "varchar" })
  public version?: string;

  @Column({ name: "image_url", type: "varchar" })
  public imageUrl?: string;

  @Column({ name: "header_image_url", type: "varchar" })
  public headerImageUrl?: string;

  @Column({ name: "category_id", type: "varchar" })
  public categoryId?: string;

  @Column({ name: "description", type: "varchar" })
  public description?: string;

  @Column({ name: "platform", type: "varchar" })
  public platform?: string;

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

  @ManyToOne(() => UserEntity, (user) => user.games)
  public owner?: UserEntity;

  @OneToMany(() => AssetEntity, (asset) => asset.game)
  public assets?: AssetEntity[];

  @ManyToMany(
    () => CollectionEntity,
    (collection: CollectionEntity) => collection.games
  )
  public collections?: CollectionEntity[];

  @ManyToMany(() => UserEntity, (user: UserEntity) => user.followingGames)
  public followers?: UserEntity[];

  constructor(
    opts: {
      id?: string;
      name?: string;
      customUrl?: string;
      version?: string;
      imageUrl?: string;
      headerImageUrl?: string;
      categoryId?: string;
      description?: string;
      platform?: string;
      isVerified?: boolean;
      isPremium?: boolean;
      isFeatured?: boolean;
      createTimestamp?: number;
      updateTimestamp?: number;
      owner?: UserEntity;
      assets?: AssetEntity[];
      collections?: CollectionEntity[];
      followers?: UserEntity[];
    } = {}
  ) {
    this.id = opts.id;
    this.name = opts.name;
    this.customUrl = opts.customUrl;
    this.version = opts.version;
    this.imageUrl = opts.imageUrl;
    this.headerImageUrl = opts.headerImageUrl;
    this.categoryId = opts.categoryId;
    this.description = opts.description;
    this.platform = opts.platform;
    this.isVerified = opts.isVerified;
    this.isPremium = opts.isPremium;
    this.isFeatured = opts.isFeatured;
    this.createTimestamp = opts.createTimestamp;
    this.updateTimestamp = opts.updateTimestamp;
    this.owner = opts.owner;
    this.assets = opts.assets;
    this.collections = opts.collections;
    this.followers = opts.followers;
  }
}
