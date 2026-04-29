import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';

// BDD: 백엔드 시나리오 — 댓글 API (docs/BDD.md 기준)

describe('댓글 API (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  // BDD: Feature: POST /posts/:id/comments — 댓글 작성
  describe('POST /posts/:id/comments', () => {
    it('정상 입력 시 201과 생성된 댓글 id를 반환한다', async () => {
      // TODO: 게시글 fixture 생성 후 검증
    });

    it('댓글 닉네임 1자 입력 시 400을 반환한다', async () => {
      return request(app.getHttpServer())
        .post('/posts/1/comments')
        .send({ nickname: '홍', password: '1234', body: '댓글 내용' })
        .expect(400);
    });

    it('댓글 비밀번호 3자 입력 시 400을 반환한다', async () => {
      return request(app.getHttpServer())
        .post('/posts/1/comments')
        .send({ nickname: '홍길동', password: '123', body: '댓글 내용' })
        .expect(400);
    });

    it('댓글 내용 500자 초과 시 400을 반환한다', async () => {
      return request(app.getHttpServer())
        .post('/posts/1/comments')
        .send({ nickname: '홍길동', password: '1234', body: 'a'.repeat(501) })
        .expect(400);
    });

    it('존재하지 않는 게시글에 댓글 작성 시 404를 반환한다', async () => {
      return request(app.getHttpServer())
        .post('/posts/99999/comments')
        .send({ nickname: '홍길동', password: '1234', body: '댓글 내용' })
        .expect(404);
    });
  });

  // BDD: Feature: DELETE /posts/:postId/comments/:commentId — 댓글 삭제
  describe('DELETE /posts/:postId/comments/:commentId', () => {
    it('올바른 비밀번호로 댓글을 소프트 삭제한다', async () => {
      // TODO: 게시글 + 댓글 fixture 생성 후 검증
    });

    it('비밀번호 불일치 시 403과 INVALID_PASSWORD를 반환한다', async () => {
      // TODO: 댓글 fixture 생성 후 검증
    });
  });
});
