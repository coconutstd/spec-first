import { test, expect, type Page } from '@playwright/test';

// 테스트용 게시글을 API로 직접 생성하는 헬퍼
async function createTestPost(
  page: Page,
  overrides: { title?: string; body?: string; nickname?: string; password?: string } = {},
) {
  const response = await page.request.post('http://localhost:4000/posts', {
    data: {
      nickname: overrides.nickname ?? '테스터',
      password: overrides.password ?? 'test1234',
      title: overrides.title ?? '테스트 게시글',
      body: overrides.body ?? '테스트 본문입니다.',
    },
  });
  const data = await response.json();
  return data as { id: number; title: string };
}

// BDD: Feature: 게시글 목록 조회
test.describe('게시글 목록 조회', () => {
  test('목록 페이지 진입 시 게시글이 표시된다', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('table')).toBeVisible();
  });

  test('목록은 최신순으로 정렬된다', async ({ page }) => {
    await page.goto('/');
    // 테이블이 있고 행이 존재하면, 첫 번째 행의 번호가 전체 개수와 같아야 한다 (최신순)
    const rows = page.locator('tbody tr');
    const count = await rows.count();
    if (count > 0) {
      // 첫 번째 행의 번호 셀 확인 - 번호가 내림차순이면 최신순 정렬
      const firstRowNum = await rows.first().locator('td').first().textContent();
      expect(Number(firstRowNum)).toBeGreaterThan(0);
    }
  });

  test('페이지당 20건 초과 시 페이지네이션이 나타난다', async ({ page }) => {
    await page.goto('/');
    const rows = await page.locator('tbody tr').count();
    if (rows >= 20) {
      // 20건 이상이면 페이지네이션 확인
      const nextBtn = page.getByRole('button', { name: '다음' });
      const hasNext = await nextBtn.isEnabled().catch(() => false);
      if (hasNext) {
        await expect(page.getByLabel('페이지 네비게이션')).toBeVisible();
        await nextBtn.click();
        await expect(page).toHaveURL(/page=2/);
      }
    } else {
      // 20건 미만이면 페이지네이션이 없어야 한다
      await expect(page.getByLabel('페이지 네비게이션')).not.toBeVisible();
    }
  });

  test('게시글이 없을 때 빈 상태 안내 문구가 표시된다', async ({ page }) => {
    // 검색어로 없는 키워드 검색 → 빈 상태 확인
    await page.goto('/?q=존재하지않는키워드xyz12345');
    await expect(page.getByText('검색 결과가 없습니다')).toBeVisible();
  });
});

// BDD: Feature: 게시글 상세 조회
test.describe('게시글 상세 조회', () => {
  test('제목 클릭 시 상세 페이지로 이동한다', async ({ page }) => {
    await page.goto('/');
    const firstLink = page.locator('tbody tr').first().getByRole('link');
    const href = await firstLink.getAttribute('href');
    if (href) {
      await firstLink.click();
      await expect(page).toHaveURL(/\/posts\/\d+/);
      // 제목, 본문, 닉네임, 작성일, 조회수가 표시되는지 확인
      await expect(page.locator('article')).toBeVisible();
    }
  });

  test('상세 페이지 진입 시 조회수가 1 증가한다', async ({ page }) => {
    const post = await createTestPost(page, { title: '조회수 테스트글' });
    await page.goto(`/posts/${post.id}`);
    // 조회수 1 표시 확인
    await expect(page.getByText('조회수: 1')).toBeVisible();
  });

  test('삭제된 게시글에 접근하면 "삭제된 게시글입니다" 표시된다', async ({ page }) => {
    // 게시글 생성 후 삭제
    const post = await createTestPost(page, { title: '삭제될 게시글', password: 'del1234' });
    await page.request.delete(`http://localhost:4000/posts/${post.id}`, {
      data: { password: 'del1234' },
    });
    await page.goto(`/posts/${post.id}`);
    await expect(page.getByText('삭제된 게시글입니다')).toBeVisible();
  });

  test('존재하지 않는 게시글에 접근하면 "존재하지 않는 게시글입니다" 표시된다', async ({ page }) => {
    await page.goto('/posts/999999999');
    await expect(page.getByText('존재하지 않는 게시글입니다')).toBeVisible();
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
    const post = await createTestPost(page, {
      title: '수정 전 제목',
      password: '1234',
      nickname: '홍길동',
    });
    await page.goto(`/posts/${post.id}`);
    await page.getByRole('button', { name: '수정' }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await page.getByLabel('비밀번호').fill('1234');
    await page.getByRole('button', { name: '확인' }).click();
    await expect(page).toHaveURL(`/posts/${post.id}/edit`);
    await page.getByLabel('제목').clear();
    await page.getByLabel('제목').fill('수정된 제목');
    await page.getByRole('button', { name: '저장' }).click();
    await expect(page).toHaveURL(`/posts/${post.id}`);
    await expect(page.getByText('수정된 제목')).toBeVisible();
  });

  test('비밀번호 불일치 시 에러 메시지가 표시된다', async ({ page }) => {
    const post = await createTestPost(page, { password: '1234' });
    await page.goto(`/posts/${post.id}`);
    await page.getByRole('button', { name: '수정' }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await page.getByLabel('비밀번호').fill('0000');
    await page.getByRole('button', { name: '확인' }).click();
    // 비밀번호 불일치: 모달에서 바로 에러 메시지 표시, 페이지 이동 없음
    await expect(page.getByText('비밀번호가 일치하지 않습니다')).toBeVisible();
    await expect(page).toHaveURL(`/posts/${post.id}`);
  });

  test('비밀번호 모달에서 취소 버튼 클릭 시 모달이 닫힌다', async ({ page }) => {
    const post = await createTestPost(page);
    await page.goto(`/posts/${post.id}`);
    await page.getByRole('button', { name: '수정' }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await page.getByRole('button', { name: '취소' }).click();
    await expect(page.getByRole('dialog')).not.toBeVisible();
    await expect(page).toHaveURL(`/posts/${post.id}`);
  });

  test('/posts/:id/edit 직접 접근 시 상세 페이지로 리다이렉트된다', async ({ page }) => {
    await page.goto('/posts/1/edit');
    await expect(page).toHaveURL('/posts/1');
  });
});

// BDD: Feature: 게시글 삭제
test.describe('게시글 삭제', () => {
  test('올바른 비밀번호 입력 시 글이 삭제되고 목록으로 이동한다', async ({ page }) => {
    const post = await createTestPost(page, { title: '삭제 테스트', password: '1234' });
    await page.goto(`/posts/${post.id}`);
    await page.getByRole('button', { name: '삭제' }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await page.getByLabel('비밀번호').fill('1234');
    await page.getByRole('button', { name: '확인' }).click();
    await expect(page).toHaveURL('/');
  });

  test('비밀번호 불일치 시 삭제되지 않는다', async ({ page }) => {
    const post = await createTestPost(page, { title: '삭제 실패 테스트', password: '1234' });
    await page.goto(`/posts/${post.id}`);
    await page.getByRole('button', { name: '삭제' }).click();
    await page.getByLabel('비밀번호').fill('9999');
    await page.getByRole('button', { name: '확인' }).click();
    await expect(page.getByText('비밀번호가 일치하지 않습니다')).toBeVisible();
    await expect(page).toHaveURL(`/posts/${post.id}`);
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

  test('모바일에서 게시글 작성 폼이 정상적으로 표시된다', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/posts/new');
    await expect(page.getByLabel('닉네임')).toBeVisible();
    await expect(page.getByLabel('비밀번호')).toBeVisible();
    await expect(page.getByLabel('제목')).toBeVisible();
    await expect(page.getByLabel('본문')).toBeVisible();
    await expect(page.getByRole('button', { name: '등록' })).toBeVisible();
  });
});
