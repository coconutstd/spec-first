import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { Comment } from './entities/comment.entity';
import { Post } from '../posts/entities/post.entity';
import { CreateCommentDto } from './dto/create-comment.dto';
import { DeleteCommentDto } from './dto/delete-comment.dto';
import {
  PostNotFoundException,
  PostDeletedException,
  CommentNotFoundException,
  CommentDeletedException,
  InvalidPasswordException,
} from '../common/exceptions/domain.exception';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
  ) {}

  async create(postId: number, dto: CreateCommentDto) {
    const post = await this.postRepository.findOne({ where: { id: String(postId) } });

    if (!post) {
      throw new PostNotFoundException();
    }

    if (post.isDeleted) {
      throw new PostDeletedException();
    }

    const rounds = parseInt(process.env.BCRYPT_ROUNDS ?? '10', 10);
    const passwordHash = await bcrypt.hash(dto.password, rounds);

    const comment = this.commentRepository.create({
      postId: String(postId),
      nickname: dto.nickname,
      body: dto.body,
      passwordHash,
      isDeleted: false,
    });

    const saved = await this.commentRepository.save(comment);

    return {
      id: Number(saved.id),
      postId: Number(saved.postId),
      nickname: saved.nickname,
      body: saved.body,
      createdAt: saved.createdAt,
    };
  }

  async remove(postId: number, commentId: number, dto: DeleteCommentDto) {
    const comment = await this.commentRepository.findOne({
      where: { id: String(commentId), postId: String(postId) },
    });

    if (!comment) {
      throw new CommentNotFoundException();
    }

    if (comment.isDeleted) {
      throw new CommentDeletedException();
    }

    const isPasswordValid = await bcrypt.compare(dto.password, comment.passwordHash);
    if (!isPasswordValid) {
      throw new InvalidPasswordException();
    }

    const deletedAt = new Date();
    await this.commentRepository.update({ id: String(commentId) }, { isDeleted: true });

    return {
      id: Number(comment.id),
      deletedAt: deletedAt.toISOString(),
    };
  }
}
