import { Column, Entity, PrimaryColumn, ManyToOne } from "typeorm";
import { AssetEntity } from "./AssetEntity";
import { UserEntity } from "./UserEntity";

@Entity({ name: "asset_histories" })
export class AssetHistoryEntity {
  @PrimaryColumn({ name: "id", type: "varchar" })
  public id?: string;

  @Column({ name: "timestamp", type: "int" })
  public timestamp?: number;

  @Column({ name: "tx_hash", type: "varchar" })
  public txHash?: string;

  @Column({ name: "erc20", type: "varchar" })
  public erc20?: string;

  @Column({ name: "erc20_amount", type: "varchar" })
  public erc20Amount?: string;

  @ManyToOne(() => AssetEntity, (asset) => asset.history)
  public asset?: AssetEntity;

  @ManyToOne(() => UserEntity, (user) => user.assetHistory)
  public owner?: UserEntity;

  constructor(
    opts: {
      id?: string;
      owner?: UserEntity;
      timestamp?: number;
      asset?: AssetEntity;
      txHash?: string;
      erc20?: string;
      erc20Amount?: string;
    } = {}
  ) {
    this.id = opts.id;
    this.owner = opts.owner;
    this.timestamp = opts.timestamp;
    this.asset = opts.asset;
    this.txHash = opts.txHash;
    this.erc20 = opts.erc20;
    this.erc20Amount = opts.erc20Amount;
  }
}
