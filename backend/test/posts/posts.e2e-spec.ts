import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';

// BDD: 백엔드 시나리오 — 게시글 API (docs/BDD.md 기준)

describe('게시글 API (e2e)', () => {
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

  // BDD: Feature: GET /posts — 게시글 목록 조회
  describe('GET /posts', () => {
    it('기본 호출 시 200과 data 배열을 반환한다', async () => {
      return request(app.getHttpServer())
        .get('/posts')
        .expect(200)
        .expect(({ body }) => {
          expect(body.data).toBeInstanceOf(Array);
          expect(body.meta).toBeDefined();
          expect(body.meta.limit).toBe(20);
        });
    });

    it('page 파라미터로 다음 페이지를 조회한다', async () => {
      return request(app.getHttpServer())
        .get('/posts?page=2')
        .expect(200)
        .expect(({ body }) => {
          expect(body.meta.page).toBe(2);
        });
    });

    it('삭제된 게시글은 목록에 포함되지 않는다', async () => {
      // TODO: 소프트 삭제된 게시글 fixture 생성 후 검증
    });

    it('빈 검색어로 요청하면 전체 목록을 반환한다', async () => {
      return request(app.getHttpServer())
        .get('/posts?q=')
        .expect(200)
        .expect(({ body }) => {
          expect(body.data).toBeInstanceOf(Array);
        });
    });
  });

  // BDD: Feature: GET /posts/:id — 게시글 상세 조회
  describe('GET /posts/:id', () => {
    it('존재하지 않는 id 조회 시 404와 POST_NOT_FOUND를 반환한다', async () => {
      return request(app.getHttpServer())
        .get('/posts/99999')
        .expect(404)
        .expect(({ body }) => {
          expect(body.code).toBe('POST_NOT_FOUND');
        });
    });

    it('삭제된 게시글 조회 시 404와 POST_DELETED를 반환한다', async () => {
      // TODO: 소프트 삭제된 게시글 fixture 생성 후 검증
    });

    it('조회할 때마다 viewCount가 1 증가한다', async () => {
      // TODO: 게시글 fixture 생성 후 검증
    });
  });

  // BDD: Feature: POST /posts — 게시글 작성
  describe('POST /posts', () => {
    it('정상 입력 시 201과 생성된 게시글 id를 반환한다', async () => {
      return request(app.getHttpServer())
        .post('/posts')
        .send({ nickname: '홍길동', password: '1234', title: '테스트 제목', body: '테스트 본문' })
        .expect(201)
        .expect(({ body }) => {
          expect(body.id).toBeDefined();
        });
    });

    it('닉네임 누락 시 400과 VALIDATION_ERROR를 반환한다', async () => {
      return request(app.getHttpServer())
        .post('/posts')
        .send({ password: '1234', title: '제목', body: '본문' })
        .expect(400)
        .expect(({ body }) => {
          expect(body.code).toBe('VALIDATION_ERROR');
        });
    });

    it('닉네임 1자 입력 시 400을 반환한다', async () => {
      return request(app.getHttpServer())
        .post('/posts')
        .send({ nickname: '홍', password: '1234', title: '제목', body: '본문' })
        .expect(400);
    });

    it('비밀번호 3자 입력 시 400을 반환한다', async () => {
      return request(app.getHttpServer())
        .post('/posts')
        .send({ nickname: '홍길동', password: '123', title: '제목', body: '본문' })
        .expect(400);
    });

    it('제목 100자 초과 시 400을 반환한다', async () => {
      return request(app.getHttpServer())
        .post('/posts')
        .send({ nickname: '홍길동', password: '1234', title: 'a'.repeat(101), body: '본문' })
        .expect(400);
    });

    it('본문 5000자 초과 시 400을 반환한다', async () => {
      return request(app.getHttpServer())
        .post('/posts')
        .send({ nickname: '홍길동', password: '1234', title: '제목', body: 'a'.repeat(5001) })
        .expect(400);
    });
  });

  // BDD: Feature: PATCH /posts/:id — 게시글 수정
  describe('PATCH /posts/:id', () => {
    it('올바른 비밀번호로 수정하면 title과 body가 변경된다', async () => {
      // TODO: 게시글 fixture 생성 후 검증
    });

    it('비밀번호 불일치 시 403과 INVALID_PASSWORD를 반환한다', async () => {
      // TODO: 게시글 fixture 생성 후 검증
    });

    it('존재하지 않는 게시글 수정 시 404를 반환한다', async () => {
      return request(app.getHttpServer())
        .patch('/posts/99999')
        .send({ password: '1234', title: '수정' })
        .expect(404);
    });
  });

  // BDD: Feature: DELETE /posts/:id — 게시글 삭제
  describe('DELETE /posts/:id', () => {
    it('올바른 비밀번호로 삭제하면 게시글과 댓글이 소프트 삭제된다', async () => {
      // TODO: 게시글 + 댓글 fixture 생성 후 검증
    });

    it('비밀번호 불일치 시 403과 INVALID_PASSWORD를 반환한다', async () => {
      // TODO: 게시글 fixture 생성 후 검증
    });
  });
});
