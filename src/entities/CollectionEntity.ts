import { AssetEntity } from "./AssetEntity";
import { Column, Entity, PrimaryColumn, OneToMany } from "typeorm";
import { CollectionHistoryEntity } from "./CollectionHistoryEntity";
import { AssetHistoryEntity } from "./AssetHistoryEntity";
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

  @OneToMany(() => AssetEntity, (asset) => asset.collection)
  public assets?: AssetEntity[];

  @Column({ name: "created_time_stamp", type: "int" })
  public createTimeStamp?: number;

  @Column({ name: "updated_time_stamp", type: "int" })
  public updateTimeStamp?: number;

  @OneToMany(() => CollectionHistoryEntity, (history) => history.collection)
  public history?: CollectionHistoryEntity[];

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
      assets?: AssetEntity[];
      history?: AssetHistoryEntity[];
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
    this.assets = opts.assets;
    this.history = opts.history;
  }
}
