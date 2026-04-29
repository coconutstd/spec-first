import { test, expect } from '@playwright/test';

// BDD: Feature: 게시글 목록 조회
test.describe('게시글 목록 조회', () => {
  test('목록 페이지 진입 시 게시글이 표시된다', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('table')).toBeVisible();
  });

  test('목록은 최신순으로 정렬된다', async ({ page }) => {
    await page.goto('/');
    // TODO: 첫 번째 행이 가장 최근 게시글인지 확인
  });

  test('페이지당 20건 초과 시 페이지네이션이 나타난다', async ({ page }) => {
    await page.goto('/');
    // TODO: 21건 이상일 때 페이지네이션 컨트롤 확인
  });

  test('게시글이 없을 때 빈 상태 안내 문구가 표시된다', async ({ page }) => {
    await page.goto('/');
    // TODO: "아직 게시글이 없습니다" 표시 확인
  });
});

// BDD: Feature: 게시글 상세 조회
test.describe('게시글 상세 조회', () => {
  test('제목 클릭 시 상세 페이지로 이동한다', async ({ page }) => {
    await page.goto('/');
    // TODO: 게시글 제목 클릭 → /posts/:id 이동 확인
  });

  test('상세 페이지 진입 시 조회수가 1 증가한다', async ({ page }) => {
    // TODO: 조회수 증가 확인
  });

  test('삭제된 게시글에 접근하면 "삭제된 게시글입니다" 표시된다', async ({ page }) => {
    await page.goto('/posts/99999');
    // TODO: 삭제된 게시글 안내 문구 확인
  });

  test('존재하지 않는 게시글에 접근하면 "존재하지 않는 게시글입니다" 표시된다', async ({ page }) => {
    await page.goto('/posts/99999');
    // TODO: 미존재 게시글 안내 문구 확인
  });
});

// BDD: Feature: 게시글 작성
test.describe('게시글 작성', () => {
  test('정상 입력 시 게시글이 등록되고 상세 페이지로 이동한다', async ({ page }) => {
    await page.goto('/posts/new');
    await page.getByLabel('닉네임').fill('홍길동');
    await page.getByLabel('비밀번호').fill('1234');
    await page.getByLabel('제목').fill('첫 번째 글');
    await page.getByLabel('본문').fill('안녕하세요');
    await page.getByRole('button', { name: '등록' }).click();
    await expect(page).toHaveURL(/\/posts\/\d+/);
    await expect(page.getByText('첫 번째 글')).toBeVisible();
  });

  test('제목 미입력 시 에러 메시지가 표시된다', async ({ page }) => {
    await page.goto('/posts/new');
    await page.getByRole('button', { name: '등록' }).click();
    await expect(page.getByText('제목을 입력해 주세요')).toBeVisible();
  });

  test('닉네임 1자 입력 시 에러 메시지가 표시된다', async ({ page }) => {
    await page.goto('/posts/new');
    await page.getByLabel('닉네임').fill('홍');
    await page.getByRole('button', { name: '등록' }).click();
    await expect(page.getByText('닉네임은 2자 이상이어야 합니다')).toBeVisible();
  });

  test('비밀번호 3자 입력 시 에러 메시지가 표시된다', async ({ page }) => {
    await page.goto('/posts/new');
    await page.getByLabel('비밀번호').fill('123');
    await page.getByRole('button', { name: '등록' }).click();
    await expect(page.getByText('비밀번호는 4자 이상이어야 합니다')).toBeVisible();
  });
});

// BDD: Feature: 게시글 수정
test.describe('게시글 수정', () => {
  test('올바른 비밀번호 입력 시 수정이 완료된다', async ({ page }) => {
    // TODO: 게시글 fixture 생성 후 수정 플로우 테스트
  });

  test('비밀번호 불일치 시 에러 메시지가 표시된다', async ({ page }) => {
    // TODO: 잘못된 비밀번호로 수정 시도
  });

  test('비밀번호 모달에서 취소 버튼 클릭 시 모달이 닫힌다', async ({ page }) => {
    // TODO: 모달 취소 후 현재 페이지 유지 확인
  });

  test('/posts/:id/edit 직접 접근 시 상세 페이지로 리다이렉트된다', async ({ page }) => {
    await page.goto('/posts/1/edit');
    await expect(page).toHaveURL('/posts/1');
  });
});

// BDD: Feature: 게시글 삭제
test.describe('게시글 삭제', () => {
  test('올바른 비밀번호 입력 시 글이 삭제되고 목록으로 이동한다', async ({ page }) => {
    // TODO: 게시글 fixture 생성 후 삭제 플로우 테스트
  });

  test('비밀번호 불일치 시 삭제되지 않는다', async ({ page }) => {
    // TODO: 잘못된 비밀번호로 삭제 시도
  });
});

// BDD: Feature: 키워드 검색
test.describe('키워드 검색', () => {
  test('키워드 검색 시 관련 게시글만 표시된다', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('searchbox').fill('NestJS');
    await page.getByRole('button', { name: '검색' }).click();
    await expect(page).toHaveURL('/?q=NestJS');
  });

  test('빈 검색어로 검색하면 전체 목록이 표시된다', async ({ page }) => {
    await page.goto('/?q=');
    await expect(page).toHaveURL('/');
  });

  test('검색 결과가 없으면 "검색 결과가 없습니다" 표시된다', async ({ page }) => {
    await page.goto('/?q=존재하지않는키워드xyz');
    await expect(page.getByText('검색 결과가 없습니다')).toBeVisible();
  });
});

// BDD: Feature: 반응형 레이아웃
test.describe('반응형 레이아웃', () => {
  test('모바일(375px) 뷰포트에서 게시글 목록이 깨지지 않는다', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/');
    await expect(page).not.toHaveURL(/error/);
    const scrollWidth = await page.evaluate(() => document.body.scrollWidth);
    expect(scrollWidth).toBeLessThanOrEqual(375);
  });
});
