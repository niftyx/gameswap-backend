import { Column, Entity, PrimaryColumn } from "typeorm";

@Entity({ name: "games" })
export class GameEntity {
  @PrimaryColumn({ name: "id", type: "varchar" })
  public id?: string;

  @Column({ name: "title", type: "varchar" })
  public title?: string;

  @Column({ name: "version", type: "varchar" })
  public version?: string;

  @Column({ name: "image_url", type: "varchar" })
  public imageUrl?: string;

  @Column({ name: "category_id", type: "varchar" })
  public categoryId?: string;

  @Column({ name: "description", type: "varchar" })
  public description?: string;

  @Column({ name: "platform", type: "varchar" })
  public platform?: string;

  @Column({ name: "owner", type: "varchar" })
  public owner?: string;

  @Column({ name: "created_at", type: "timestamptz", default: "now()" })
  public createdAt?: string;

  constructor(
    opts: {
      id?: string;
      title?: string;
      description?: string;
      imageUrl?: string;
      categoryId?: string;
      version?: string;
      platform?: string;
      owner?: string;
    } = {}
  ) {
    this.id = opts.id;
    this.title = opts.title;
    this.description = opts.description;
    this.imageUrl = opts.imageUrl;
    this.categoryId = opts.categoryId;
    this.version = opts.version;
    this.platform = opts.platform;
    this.owner = opts.owner;
  }
}
