import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';

// BDD: 백엔드 시나리오 — 검색 + Rate Limit (docs/BDD.md 기준)

describe('검색 API (e2e)', () => {
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

  // BDD: Feature: GET /posts?q= — 키워드 검색
  describe('GET /posts?q=', () => {
    it('키워드가 제목에 포함된 게시글을 반환한다', async () => {
      // TODO: "NestJS" 포함 게시글 2건 fixture 생성 후 검증
    });

    it('키워드가 본문에 포함된 게시글을 반환한다', async () => {
      // TODO: fixture 생성 후 검증
    });

    it('일치하는 게시글이 없으면 빈 배열을 반환한다', async () => {
      return request(app.getHttpServer())
        .get('/posts?q=존재하지않는키워드xyz')
        .expect(200)
        .expect(({ body }) => {
          expect(body.data).toHaveLength(0);
        });
    });

    it('빈 검색어로 요청하면 전체 목록을 반환한다', async () => {
      return request(app.getHttpServer())
        .get('/posts?q=')
        .expect(200)
        .expect(({ body }) => {
          expect(body.data).toBeInstanceOf(Array);
        });
    });

    it('검색 결과가 21건 이상이면 페이지네이션이 적용된다', async () => {
      // TODO: 21건 fixture 생성 후 검증
    });
  });

  // BDD: Feature: Rate Limit — 분당 IP당 글쓰기 5회 제한
  describe('Rate Limit', () => {
    it('동일 IP에서 1분 내 6번째 글쓰기 시 429를 반환한다', async () => {
      const body = { nickname: '홍길동', password: '1234', title: '제목', body: '본문' };
      for (let i = 0; i < 5; i++) {
        await request(app.getHttpServer()).post('/posts').send(body).expect(201);
      }
      return request(app.getHttpServer())
        .post('/posts')
        .send(body)
        .expect(429)
        .expect(({ body: res }) => {
          expect(res.code).toBe('RATE_LIMIT_EXCEEDED');
        });
    });
  });
});
