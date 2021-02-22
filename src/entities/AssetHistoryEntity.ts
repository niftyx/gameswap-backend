import { Column, Entity, PrimaryColumn, ManyToOne } from "typeorm";
import { AssetEntity } from "./AssetEntity";

@Entity({ name: "asset_histories" })
export class AssetHistoryEntity {
  @PrimaryColumn({ name: "id", type: "varchar" })
  public id?: string;

  @Column({ name: "owner", type: "varchar" })
  public owner?: string;

  @Column({ name: "timestamp", type: "int" })
  public timestamp?: number;

  @Column({ name: "tx_hash", type: "varchar" })
  public txHash?: string;

  @ManyToOne(() => AssetEntity, (asset) => asset.history)
  public asset?: AssetEntity;

  constructor(
    opts: {
      id?: string;
      owner?: string;
      timestamp?: number;
      asset?: AssetEntity;
      txHash?: string;
    } = {}
  ) {
    this.id = opts.id;
    this.owner = opts.owner;
    this.timestamp = opts.timestamp;
    this.asset = opts.asset;
    this.txHash = opts.txHash;
  }
}
