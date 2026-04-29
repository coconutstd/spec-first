import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../../src/app.module';
import { HttpExceptionFilter } from '../../src/common/filters/http-exception.filter';

// BDD: 백엔드 시나리오 — 검색 + Rate Limit (docs/BDD.md 기준)

describe('검색 API (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }),
    );
    app.useGlobalFilters(new HttpExceptionFilter());
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  // BDD: Feature: GET /posts?q= — 키워드 검색
  describe('GET /posts?q=', () => {
    it('키워드가 제목에 포함된 게시글을 반환한다', async () => {
      // fixture: "NestJS" 포함 게시글 2건, 관련없는 3건
      const keyword = 'NestJS검색키워드' + Date.now();

      await Promise.all([
        request(app.getHttpServer())
          .post('/posts')
          .send({ nickname: '작성자', password: '1234', title: `${keyword} 강좌`, body: '본문' }),
        request(app.getHttpServer())
          .post('/posts')
          .send({ nickname: '작성자', password: '1234', title: `${keyword} 심화`, body: '본문' }),
        request(app.getHttpServer())
          .post('/posts')
          .send({ nickname: '작성자', password: '1234', title: '관계없는 글', body: '본문' }),
      ]);

      return request(app.getHttpServer())
        .get(`/posts?q=${keyword}`)
        .expect(200)
        .expect(({ body }) => {
          expect(body.data.length).toBeGreaterThanOrEqual(2);
          body.data.forEach((item: any) => {
            const containsKeyword =
              item.title.includes(keyword) || (item.body && item.body.includes(keyword));
            expect(containsKeyword).toBe(true);
          });
        });
    });

    it('키워드가 본문에 포함된 게시글을 반환한다', async () => {
      const keyword = 'TypeScript본문키워드' + Date.now();

      await request(app.getHttpServer())
        .post('/posts')
        .send({ nickname: '작성자', password: '1234', title: '일반 제목', body: `${keyword} 활용` });

      return request(app.getHttpServer())
        .get(`/posts?q=${keyword}`)
        .expect(200)
        .expect(({ body }) => {
          expect(body.data.length).toBeGreaterThanOrEqual(1);
        });
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
      const keyword = 'Pagination키워드' + Date.now();

      // 21건 생성
      for (let i = 0; i < 21; i++) {
        await request(app.getHttpServer())
          .post('/posts')
          .send({
            nickname: '작성자',
            password: '1234',
            title: `${keyword} 글${i + 1}`,
            body: '본문',
          });
      }

      return request(app.getHttpServer())
        .get(`/posts?q=${keyword}&page=2`)
        .expect(200)
        .expect(({ body }) => {
          expect(body.data.length).toBeGreaterThanOrEqual(1);
          expect(body.meta.page).toBe(2);
        });
    });
  });

  // BDD: Feature: Rate Limit — 분당 IP당 글쓰기 5회 제한
  describe('Rate Limit', () => {
    let rateLimitApp: INestApplication;

    beforeAll(async () => {
      // Rate Limit 전용 앱: THROTTLE_LIMIT=5 로 별도 인스턴스 생성
      const originalLimit = process.env.THROTTLE_LIMIT;
      process.env.THROTTLE_LIMIT = '5';

      const moduleFixture: TestingModule = await Test.createTestingModule({
        imports: [AppModule],
      }).compile();

      process.env.THROTTLE_LIMIT = originalLimit;

      rateLimitApp = moduleFixture.createNestApplication();
      rateLimitApp.useGlobalPipes(
        new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }),
      );
      rateLimitApp.useGlobalFilters(new HttpExceptionFilter());
      await rateLimitApp.init();
    });

    afterAll(async () => {
      await rateLimitApp.close();
    });

    it('동일 IP에서 1분 내 6번째 글쓰기 시 429를 반환한다', async () => {
      const postBody = { nickname: '홍길동', password: '1234', title: '제목', body: '본문' };
      for (let i = 0; i < 5; i++) {
        await request(rateLimitApp.getHttpServer()).post('/posts').send(postBody).expect(201);
      }
      return request(rateLimitApp.getHttpServer())
        .post('/posts')
        .send(postBody)
        .expect(429)
        .expect(({ body: res }) => {
          expect(res.code).toBe('RATE_LIMIT_EXCEEDED');
        });
    });
  });
});
