import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Post } from '../../posts/entities/post.entity';

@Entity('comment')
export class Comment {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id: string;

  @Index('idx_comment_post_id')
  @Column({ name: 'post_id', type: 'bigint' })
  postId: string;

  @Column({ type: 'varchar', length: 20 })
  nickname: string;

  @Column({ name: 'password_hash', type: 'varchar', length: 255 })
  passwordHash: string;

  @Column({ type: 'varchar', length: 500 })
  body: string;

  @Index('idx_comment_is_deleted')
  @Column({ name: 'is_deleted', type: 'boolean', default: false })
  isDeleted: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => Post, (post) => post.comments)
  @JoinColumn({ name: 'post_id' })
  post: Post;
}
