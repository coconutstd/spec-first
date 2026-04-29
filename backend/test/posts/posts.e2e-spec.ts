import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../../src/app.module';
import { HttpExceptionFilter } from '../../src/common/filters/http-exception.filter';

// BDD: 백엔드 시나리오 — 게시글 API (docs/BDD.md 기준)

describe('게시글 API (e2e)', () => {
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
      // fixture: 게시글 작성 후 삭제
      const createRes = await request(app.getHttpServer())
        .post('/posts')
        .send({ nickname: '삭제용', password: 'pass1234', title: '삭제될글', body: '내용' })
        .expect(201);

      const postId = createRes.body.id;

      await request(app.getHttpServer())
        .delete(`/posts/${postId}`)
        .send({ password: 'pass1234' })
        .expect(200);

      const listRes = await request(app.getHttpServer()).get('/posts').expect(200);

      const ids = listRes.body.data.map((p: any) => p.id);
      expect(ids).not.toContain(postId);
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
      // fixture: 게시글 작성 후 삭제
      const createRes = await request(app.getHttpServer())
        .post('/posts')
        .send({ nickname: '삭제유저', password: 'pass1234', title: '삭제게시글', body: '본문' })
        .expect(201);

      const postId = createRes.body.id;

      await request(app.getHttpServer())
        .delete(`/posts/${postId}`)
        .send({ password: 'pass1234' })
        .expect(200);

      return request(app.getHttpServer())
        .get(`/posts/${postId}`)
        .expect(404)
        .expect(({ body }) => {
          expect(body.code).toBe('POST_DELETED');
        });
    });

    it('조회할 때마다 viewCount가 1 증가한다', async () => {
      // fixture: 게시글 작성
      const createRes = await request(app.getHttpServer())
        .post('/posts')
        .send({ nickname: '조회유저', password: 'pass1234', title: '조회테스트', body: '본문' })
        .expect(201);

      const postId = createRes.body.id;

      const first = await request(app.getHttpServer()).get(`/posts/${postId}`).expect(200);
      const second = await request(app.getHttpServer()).get(`/posts/${postId}`).expect(200);

      expect(second.body.viewCount).toBe(first.body.viewCount + 1);
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
      // fixture: 게시글 작성
      const createRes = await request(app.getHttpServer())
        .post('/posts')
        .send({ nickname: '수정유저', password: 'pass1234', title: '원본제목', body: '원본본문' })
        .expect(201);

      const postId = createRes.body.id;

      return request(app.getHttpServer())
        .patch(`/posts/${postId}`)
        .send({ password: 'pass1234', title: '수정된 제목', body: '수정된 본문' })
        .expect(200)
        .expect(({ body }) => {
          expect(body.title).toBe('수정된 제목');
          expect(body.body).toBe('수정된 본문');
        });
    });

    it('비밀번호 불일치 시 403과 INVALID_PASSWORD를 반환한다', async () => {
      // fixture: 게시글 작성
      const createRes = await request(app.getHttpServer())
        .post('/posts')
        .send({ nickname: '수정유저', password: 'pass1234', title: '제목', body: '본문' })
        .expect(201);

      const postId = createRes.body.id;

      return request(app.getHttpServer())
        .patch(`/posts/${postId}`)
        .send({ password: 'wrongpass', title: '수정제목' })
        .expect(403)
        .expect(({ body }) => {
          expect(body.code).toBe('INVALID_PASSWORD');
        });
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
      // fixture: 게시글 작성 후 댓글 2개 추가
      const createRes = await request(app.getHttpServer())
        .post('/posts')
        .send({ nickname: '삭제유저', password: 'pass1234', title: '삭제글', body: '본문' })
        .expect(201);

      const postId = createRes.body.id;

      await request(app.getHttpServer())
        .post(`/posts/${postId}/comments`)
        .send({ nickname: '댓글러1', password: 'comm1234', body: '댓글1' })
        .expect(201);

      await request(app.getHttpServer())
        .post(`/posts/${postId}/comments`)
        .send({ nickname: '댓글러2', password: 'comm1234', body: '댓글2' })
        .expect(201);

      const deleteRes = await request(app.getHttpServer())
        .delete(`/posts/${postId}`)
        .send({ password: 'pass1234' })
        .expect(200);

      expect(deleteRes.body.id).toBe(postId);
      expect(deleteRes.body.deletedAt).toBeDefined();

      // 삭제된 게시글 조회 시 POST_DELETED 반환
      return request(app.getHttpServer())
        .get(`/posts/${postId}`)
        .expect(404)
        .expect(({ body }) => {
          expect(body.code).toBe('POST_DELETED');
        });
    });

    it('비밀번호 불일치 시 403과 INVALID_PASSWORD를 반환한다', async () => {
      // fixture: 게시글 작성
      const createRes = await request(app.getHttpServer())
        .post('/posts')
        .send({ nickname: '삭제유저', password: 'pass1234', title: '삭제글', body: '본문' })
        .expect(201);

      const postId = createRes.body.id;

      return request(app.getHttpServer())
        .delete(`/posts/${postId}`)
        .send({ password: 'wrongpass' })
        .expect(403)
        .expect(({ body }) => {
          expect(body.code).toBe('INVALID_PASSWORD');
        });
    });
  });
});
