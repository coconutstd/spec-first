import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule } from '@nestjs/throttler';
import { Post } from './posts/entities/post.entity';
import { Comment } from './comments/entities/comment.entity';
import { PostsModule } from './posts/posts.module';
import { CommentsModule } from './comments/comments.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const databaseUrl =
          process.env.TEST_DATABASE_URL ??
          configService.get<string>('DATABASE_URL') ??
          'postgresql://board:board1234@localhost:5432/board_db';

        return {
          type: 'postgres',
          url: databaseUrl,
          entities: [Post, Comment],
          synchronize: true,
          logging: false,
        };
      },
    }),
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        throttlers: [
          {
            ttl: (configService.get<number>('THROTTLE_TTL') ?? 60) * 1000,
            limit: configService.get<number>('THROTTLE_LIMIT') ?? 5,
          },
        ],
      }),
    }),
    PostsModule,
    CommentsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
