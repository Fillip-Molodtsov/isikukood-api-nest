import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity()
export class BornSameDayCounter {
  @PrimaryColumn()
  public id: number;

  @Column()
  public count: number;
}
