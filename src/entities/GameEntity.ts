import { Column, Entity, OneToMany, PrimaryColumn } from "typeorm";
import { AssetEntity } from "./AssetEntity";

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

  @Column({ name: "owner", type: "varchar" })
  public owner?: string;

  @Column({ name: "created_at", type: "int" })
  public createdAt?: number;

  @OneToMany(() => AssetEntity, (asset) => asset.game)
  public assets?: AssetEntity[];

  constructor(
    opts: {
      id?: string;
      name?: string;
      customUrl?: string;
      description?: string;
      imageUrl?: string;
      headerImageUrl?: string;
      categoryId?: string;
      version?: string;
      platform?: string;
      owner?: string;
      assets?: AssetEntity[];
      createdAt?: number;
    } = {}
  ) {
    this.id = opts.id;
    this.name = opts.name;
    this.customUrl = opts.customUrl;
    this.description = opts.description;
    this.imageUrl = opts.imageUrl;
    this.headerImageUrl = opts.headerImageUrl;
    this.categoryId = opts.categoryId;
    this.version = opts.version;
    this.platform = opts.platform;
    this.owner = opts.owner;
    this.assets = opts.assets;
    this.createdAt = opts.createdAt;
  }
}
