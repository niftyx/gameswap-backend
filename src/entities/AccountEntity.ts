import { Column, Entity, PrimaryColumn, OneToMany } from "typeorm";
import { AssetEntity } from "./AssetEntity";

@Entity({ name: "accounts" })
export class AccountEntity {
  @PrimaryColumn({ name: "id", type: "varchar" })
  public id?: string;

  @Column({ name: "address", type: "varchar" })
  public address?: string;

  @Column({ name: "asset_count", type: "bigint" })
  public assetCount?: string;

  @Column({ name: "create_time_stamp", type: "int" })
  public createTimeStamp?: number;

  @OneToMany(() => AssetEntity, (asset) => asset.currentOwner)
  public assets?: AssetEntity[];

  constructor(
    opts: {
      id?: string;
      address?: string;
      assetCount?: string;
      createTimeStamp?: number;
      assets?: AssetEntity[];
    } = {}
  ) {
    this.id = opts.id;
    this.address = opts.address;
    this.assetCount = opts.assetCount;
    this.createTimeStamp = opts.createTimeStamp;
    this.assets = opts.assets;
  }
}
