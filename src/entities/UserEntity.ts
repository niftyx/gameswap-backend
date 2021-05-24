import { CollectionEntity } from "./CollectionEntity";
import {
  Column,
  Entity,
  PrimaryColumn,
  OneToMany,
  ManyToMany,
  JoinTable,
} from "typeorm";
import { AssetEntity } from "./AssetEntity";
import { GameEntity } from "./GameEntity";
import { CollectionHistoryEntity } from "./CollectionHistoryEntity";
import { AssetHistoryEntity } from "./AssetHistoryEntity";

@Entity({ name: "users" })
export class UserEntity {
  @PrimaryColumn({ name: "id", type: "varchar" })
  public id?: string;

  @Column({ name: "address", type: "varchar" })
  public address?: string;

  @Column({ name: "name", type: "varchar" })
  public name?: string;

  @Column({ name: "custom_url", type: "varchar" })
  public customUrl?: string;

  @Column({ name: "image_url", type: "varchar" })
  public imageUrl?: string;

  @Column({ name: "header_image_url", type: "varchar" })
  public headerImageUrl?: string;

  @Column({ name: "bio", type: "varchar" })
  public bio?: string;

  @Column({ name: "twitter_username", type: "varchar" })
  public twitterUsername?: string;

  @Column({ name: "twitter_verified", type: "boolean" })
  public twitterVerified?: boolean;

  @Column({ name: "twitch_username", type: "varchar" })
  public twitchUsername?: string;

  @Column({ name: "facebook_username", type: "varchar" })
  public facebookUsername?: string;

  @Column({ name: "youtube_username", type: "varchar" })
  public youtubeUsername?: string;

  @Column({ name: "instagram_username", type: "varchar" })
  public instagramUsername?: string;

  @Column({ name: "tiktok_username", type: "varchar" })
  public tiktokUsername?: string;

  @Column({ name: "personal_site", type: "varchar" })
  public personalSite?: string;

  @Column({ name: "create_time_stamp", type: "int" })
  public createTimestamp?: number;

  @Column({ name: "update_time_stamp", type: "int" })
  public updateTimestamp?: number;

  @OneToMany(() => AssetEntity, (asset) => asset.currentOwner)
  public assets?: AssetEntity[];

  @OneToMany(() => GameEntity, (game) => game.owner)
  public games?: GameEntity[];

  @OneToMany(() => CollectionEntity, (collection) => collection.owner)
  public collections?: CollectionEntity[];

  @OneToMany(() => AssetEntity, (asset) => asset.creator)
  public createdAssets?: AssetEntity[];

  @ManyToMany(() => GameEntity, (game: GameEntity) => game.followers)
  @JoinTable()
  public followingGames?: GameEntity[];

  @ManyToMany(() => AssetEntity, (asset: AssetEntity) => asset.likers)
  @JoinTable()
  public likeAssets?: AssetEntity[];

  @ManyToMany(() => UserEntity, (user: UserEntity) => user.followers)
  public followings?: UserEntity[];

  @ManyToMany(() => UserEntity, (user: UserEntity) => user.followings)
  @JoinTable()
  public followers?: UserEntity[];

  @OneToMany(
    () => CollectionHistoryEntity,
    (collectionHistory) => collectionHistory.owner
  )
  public collectionHistory?: CollectionHistoryEntity[];

  @OneToMany(() => AssetHistoryEntity, (assetHistory) => assetHistory.owner)
  public assetHistory?: AssetHistoryEntity[];

  constructor(
    opts: {
      id?: string;
      address?: string;
      name?: string;
      customUrl?: string;
      imageUrl?: string;
      headerImageUrl?: string;
      bio?: string;
      twitterUsername?: string;
      twitterVerified?: boolean;
      twitchUsername?: string;
      facebookUsername?: string;
      youtubeUsername?: string;
      instagramUsername?: string;
      tiktokUsername?: string;
      personalSite?: string;
      createTimestamp?: number;
      updateTimestamp?: number;
      assets?: AssetEntity[];
      games?: GameEntity[];
      collections?: CollectionEntity[];
      createdAssets?: AssetEntity[];
      followingGames?: GameEntity[];
      likeAssets?: AssetEntity[];
      followings?: UserEntity[];
      followers?: UserEntity[];
    } = {}
  ) {
    this.id = opts.id;
    this.address = opts.address;
    this.name = opts.name;
    this.customUrl = opts.customUrl;
    this.imageUrl = opts.imageUrl;
    this.headerImageUrl = opts.headerImageUrl;
    this.bio = opts.bio;
    this.twitterUsername = opts.twitterUsername;
    this.twitterVerified = opts.twitterVerified;
    this.twitchUsername = opts.twitchUsername;
    this.facebookUsername = opts.facebookUsername;
    this.youtubeUsername = opts.youtubeUsername;
    this.instagramUsername = opts.instagramUsername;
    this.tiktokUsername = opts.tiktokUsername;
    this.personalSite = opts.personalSite;
    this.createTimestamp = opts.createTimestamp;
    this.updateTimestamp = opts.updateTimestamp;
    this.assets = opts.assets;
    this.games = opts.games;
    this.createdAssets = opts.createdAssets;
    this.followingGames = opts.followingGames;
    this.likeAssets = opts.likeAssets;
    this.followings = opts.followings;
    this.followers = opts.followers;
  }
}
