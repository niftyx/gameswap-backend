import { Column, Entity, PrimaryColumn, OneToMany } from "typeorm";
import { AssetEntity } from "./AssetEntity";

@Entity({ name: "accounts" })
export class AccountEntity {
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

  @Column({ name: "bio", type: "varchar" })
  public bio?: string;

  @Column({ name: "twitter_username", type: "varchar" })
  public twitterUsername?: string;

  @Column({ name: "personal_site", type: "varchar" })
  public personalSite?: string;

  @Column({ name: "asset_count", type: "varchar" })
  public assetCount?: string;

  @Column({ name: "create_time_stamp", type: "int" })
  public createTimeStamp?: number;

  @OneToMany(() => AssetEntity, (asset) => asset.currentOwner)
  public assets?: AssetEntity[];

  @OneToMany(() => AssetEntity, (asset) => asset.creator)
  public createdAssets?: AssetEntity[];

  constructor(
    opts: {
      id?: string;
      address?: string;
      name?: string;
      customUrl?: string;
      imageUrl?: string;
      bio?: string;
      twitterUsername?: string;
      personalSite?: string;
      assetCount?: string;
      createTimeStamp?: number;
      assets?: AssetEntity[];
      createdAssets?: AssetEntity[];
    } = {}
  ) {
    this.id = opts.id;
    this.address = opts.address;
    this.name = opts.name;
    this.customUrl = opts.customUrl;
    this.imageUrl = opts.imageUrl;
    this.bio = opts.bio;
    this.twitterUsername = opts.twitterUsername;
    this.personalSite = opts.personalSite;
    this.assetCount = opts.assetCount;
    this.createTimeStamp = opts.createTimeStamp;
    this.assets = opts.assets;
    this.createdAssets = opts.createdAssets;
  }
}
