import { Column, Entity, PrimaryColumn, ManyToOne } from "typeorm";
import { CollectionEntity } from "./CollectionEntity";
import { UserEntity } from "./UserEntity";

@Entity({ name: "collection_histories" })
export class CollectionHistoryEntity {
  @PrimaryColumn({ name: "id", type: "varchar" })
  public id?: string;

  @Column({ name: "timestamp", type: "int" })
  public timestamp?: number;

  @Column({ name: "tx_hash", type: "varchar" })
  public txHash?: string;

  @ManyToOne(() => CollectionEntity, (collection) => collection.history)
  public collection?: CollectionEntity;

  @ManyToOne(() => UserEntity, (user) => user.collectionHistory)
  public owner?: UserEntity;

  constructor(
    opts: {
      id?: string;
      timestamp?: number;
      txHash?: string;
      collection?: CollectionEntity;
      owner?: UserEntity;
    } = {}
  ) {
    this.id = opts.id;
    this.owner = opts.owner;
    this.timestamp = opts.timestamp;
    this.collection = opts.collection;
    this.txHash = opts.txHash;
  }
}
