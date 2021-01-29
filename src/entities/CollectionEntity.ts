import { Column, Entity, PrimaryColumn } from "typeorm";

@Entity({ name: "collections" })
export class CollectionEntity {
  @PrimaryColumn({ name: "id", type: "varchar" })
  public id?: string;

  @Column({ name: "display_name", type: "varchar" })
  public displayName?: string;

  @Column({ name: "description", type: "varchar" })
  public description?: string;

  @Column({ name: "image_url", type: "varchar" })
  public imageUrl?: string;

  @Column({ name: "short_url", type: "varchar" })
  public shortUrl?: string;

  @Column({ name: "created_at", type: "timestamptz", default: "now()" })
  public createdAt?: string;

  constructor(
    opts: {
      id?: string;
      displayName?: string;
      description?: string;
      imageUrl?: string;
      shortUrl?: string;
    } = {}
  ) {
    this.id = opts.id;
    this.displayName = opts.displayName;
    this.description = opts.description;
    this.imageUrl = opts.imageUrl;
    this.shortUrl = opts.shortUrl;
  }
}
