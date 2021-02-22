import { Column, Entity, PrimaryColumn, ManyToOne } from "typeorm";
import { CollectionEntity } from "./CollectionEntity";

@Entity({ name: "collection_histories" })
export class CollectionHistoryEntity {
  @PrimaryColumn({ name: "id", type: "varchar" })
  public id?: string;

  @Column({ name: "owner", type: "varchar" })
  public owner?: string;

  @Column({ name: "timestamp", type: "int" })
  public timestamp?: number;

  @Column({ name: "tx_hash", type: "varchar" })
  public txHash?: string;

  @ManyToOne(() => CollectionEntity, (collection) => collection.history)
  public collection?: CollectionEntity;

  constructor(
    opts: {
      id?: string;
      owner?: string;
      timestamp?: number;
      collection?: CollectionEntity;
      txHash?: string;
    } = {}
  ) {
    this.id = opts.id;
    this.owner = opts.owner;
    this.timestamp = opts.timestamp;
    this.collection = opts.collection;
    this.txHash = opts.txHash;
  }
}
