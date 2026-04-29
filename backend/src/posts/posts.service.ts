import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { Post } from './entities/post.entity';
import { Comment } from '../comments/entities/comment.entity';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { DeletePostDto } from './dto/delete-post.dto';
import { ListPostsDto } from './dto/list-posts.dto';
import {
  PostNotFoundException,
  PostDeletedException,
  InvalidPasswordException,
} from '../common/exceptions/domain.exception';

const PAGE_LIMIT = 20;

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,
    private readonly dataSource: DataSource,
  ) {}

  async findAll(dto: ListPostsDto) {
    const page = dto.page ?? 1;
    const query = dto.q?.trim();
    const skip = (page - 1) * PAGE_LIMIT;

    const qb = this.postRepository
      .createQueryBuilder('post')
      .leftJoin(
        'comment',
        'c',
        'c.post_id = post.id AND c.is_deleted = false',
      )
      .select([
        'post.id AS id',
        'post.title AS title',
        'post.nickname AS nickname',
        'post.view_count AS "viewCount"',
        'COUNT(c.id) AS "commentCount"',
        'post.created_at AS "createdAt"',
      ])
      .where('post.is_deleted = false')
      .groupBy('post.id')
      .orderBy('post.created_at', 'DESC')
      .offset(skip)
      .limit(PAGE_LIMIT);

    if (query) {
      qb.andWhere('(post.title ILIKE :q OR post.body ILIKE :q)', {
        q: `%${query}%`,
      });
    }

    const countQb = this.postRepository
      .createQueryBuilder('post')
      .where('post.is_deleted = false');

    if (query) {
      countQb.andWhere('(post.title ILIKE :q OR post.body ILIKE :q)', {
        q: `%${query}%`,
      });
    }

    const [rawItems, total] = await Promise.all([
      qb.getRawMany(),
      countQb.getCount(),
    ]);

    const data = rawItems.map((row) => ({
      id: Number(row.id),
      title: row.title,
      nickname: row.nickname,
      viewCount: row.viewCount,
      commentCount: Number(row.commentCount),
      createdAt: row.createdAt,
    }));

    return {
      data,
      meta: {
        total,
        page,
        totalPages: Math.ceil(total / PAGE_LIMIT),
        limit: PAGE_LIMIT,
      },
    };
  }

  async findOne(id: number) {
    const post = await this.postRepository.findOne({ where: { id: String(id) } });

    if (!post) {
      throw new PostNotFoundException();
    }

    if (post.isDeleted) {
      throw new PostDeletedException();
    }

    // Atomic view count increment
    await this.postRepository.increment({ id: String(id) }, 'viewCount', 1);

    return {
      id: Number(post.id),
      title: post.title,
      body: post.body,
      nickname: post.nickname,
      viewCount: post.viewCount + 1,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
    };
  }

  async create(dto: CreatePostDto) {
    const rounds = parseInt(process.env.BCRYPT_ROUNDS ?? '10', 10);
    const passwordHash = await bcrypt.hash(dto.password, rounds);

    const post = this.postRepository.create({
      title: dto.title,
      body: dto.body,
      nickname: dto.nickname,
      passwordHash,
      viewCount: 0,
      isDeleted: false,
    });

    const saved = await this.postRepository.save(post);

    return {
      id: Number(saved.id),
      title: saved.title,
      nickname: saved.nickname,
      viewCount: saved.viewCount,
      createdAt: saved.createdAt,
      updatedAt: saved.updatedAt,
    };
  }

  async update(id: number, dto: UpdatePostDto) {
    const post = await this.postRepository.findOne({ where: { id: String(id) } });

    if (!post) {
      throw new PostNotFoundException();
    }

    if (post.isDeleted) {
      throw new PostDeletedException();
    }

    const isPasswordValid = await bcrypt.compare(dto.password, post.passwordHash);
    if (!isPasswordValid) {
      throw new InvalidPasswordException();
    }

    if (dto.title !== undefined) post.title = dto.title;
    if (dto.body !== undefined) post.body = dto.body;

    const saved = await this.postRepository.save(post);

    return {
      id: Number(saved.id),
      title: saved.title,
      body: saved.body,
      nickname: saved.nickname,
      viewCount: saved.viewCount,
      createdAt: saved.createdAt,
      updatedAt: saved.updatedAt,
    };
  }

  async remove(id: number, dto: DeletePostDto) {
    const post = await this.postRepository.findOne({ where: { id: String(id) } });

    if (!post) {
      throw new PostNotFoundException();
    }

    if (post.isDeleted) {
      throw new PostDeletedException();
    }

    const isPasswordValid = await bcrypt.compare(dto.password, post.passwordHash);
    if (!isPasswordValid) {
      throw new InvalidPasswordException();
    }

    const deletedAt = new Date();

    await this.dataSource.transaction(async (manager) => {
      await manager.update(Post, { id: String(id) }, { isDeleted: true });
      await manager.update(Comment, { postId: String(id) }, { isDeleted: true });
    });

    return {
      id: Number(post.id),
      deletedAt: deletedAt.toISOString(),
    };
  }
}
