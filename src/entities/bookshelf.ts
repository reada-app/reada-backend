import {
  Entity,
  BaseEntity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany
} from 'typeorm';
import User from './user';
import BookLink from './bookLink';

@Entity()
class Bookshelf extends BaseEntity {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id!: number;

  @Column({ type: 'bigint', unsigned: true })
  userId!: number;

  @Column({ type: 'varchar', length: 50, nullable: false })
  name!: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt!: Date;

  @ManyToOne(
    type => User,
    user => user.ratings
  )
  user!: User;

  @OneToMany(
    type => BookLink,
    bookLink => bookLink.bookshelf
  )
  bookLinks!: BookLink[];
}

export default Bookshelf;
