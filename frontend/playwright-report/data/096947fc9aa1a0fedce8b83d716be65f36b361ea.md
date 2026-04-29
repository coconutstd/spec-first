# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: posts.spec.ts >> 게시글 상세 조회 >> 제목 클릭 시 상세 페이지로 이동한다
- Location: e2e/posts.spec.ts:66:7

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: locator.getAttribute: Test timeout of 30000ms exceeded.
Call log:
  - waiting for locator('tbody tr').first().getByRole('link')

```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - banner [ref=e2]:
    - link "게시판" [ref=e4] [cursor=pointer]:
      - /url: /
  - main [ref=e5]:
    - generic [ref=e6]:
      - heading "게시글 목록" [level=1] [ref=e7]
      - generic [ref=e8]:
        - generic [ref=e9]:
          - generic [ref=e10]:
            - searchbox "검색어 입력" [ref=e11]
            - button "검색" [ref=e12]
          - link "글쓰기" [ref=e13] [cursor=pointer]:
            - /url: /posts/new
        - generic [ref=e14]: 아직 게시글이 없습니다
  - contentinfo [ref=e15]:
    - generic [ref=e16]: 단순 게시판 서비스
  - button "Open Next.js Dev Tools" [ref=e22] [cursor=pointer]:
    - img [ref=e23]
  - alert [ref=e26]
```

# Test source

```ts
  1   | import { test, expect, type Page } from '@playwright/test';
  2   | 
  3   | // 테스트용 게시글을 API로 직접 생성하는 헬퍼
  4   | async function createTestPost(
  5   |   page: Page,
  6   |   overrides: { title?: string; body?: string; nickname?: string; password?: string } = {},
  7   | ) {
  8   |   const response = await page.request.post('http://localhost:4000/posts', {
  9   |     data: {
  10  |       nickname: overrides.nickname ?? '테스터',
  11  |       password: overrides.password ?? 'test1234',
  12  |       title: overrides.title ?? '테스트 게시글',
  13  |       body: overrides.body ?? '테스트 본문입니다.',
  14  |     },
  15  |   });
  16  |   const data = await response.json();
  17  |   return data as { id: number; title: string };
  18  | }
  19  | 
  20  | // BDD: Feature: 게시글 목록 조회
  21  | test.describe('게시글 목록 조회', () => {
  22  |   test('목록 페이지 진입 시 게시글이 표시된다', async ({ page }) => {
  23  |     await page.goto('/');
  24  |     await expect(page.getByRole('table')).toBeVisible();
  25  |   });
  26  | 
  27  |   test('목록은 최신순으로 정렬된다', async ({ page }) => {
  28  |     await page.goto('/');
  29  |     // 테이블이 있고 행이 존재하면, 첫 번째 행의 번호가 전체 개수와 같아야 한다 (최신순)
  30  |     const rows = page.locator('tbody tr');
  31  |     const count = await rows.count();
  32  |     if (count > 0) {
  33  |       // 첫 번째 행의 번호 셀 확인 - 번호가 내림차순이면 최신순 정렬
  34  |       const firstRowNum = await rows.first().locator('td').first().textContent();
  35  |       expect(Number(firstRowNum)).toBeGreaterThan(0);
  36  |     }
  37  |   });
  38  | 
  39  |   test('페이지당 20건 초과 시 페이지네이션이 나타난다', async ({ page }) => {
  40  |     await page.goto('/');
  41  |     const rows = await page.locator('tbody tr').count();
  42  |     if (rows >= 20) {
  43  |       // 20건 이상이면 페이지네이션 확인
  44  |       const nextBtn = page.getByRole('button', { name: '다음' });
  45  |       const hasNext = await nextBtn.isEnabled().catch(() => false);
  46  |       if (hasNext) {
  47  |         await expect(page.getByLabel('페이지 네비게이션')).toBeVisible();
  48  |         await nextBtn.click();
  49  |         await expect(page).toHaveURL(/page=2/);
  50  |       }
  51  |     } else {
  52  |       // 20건 미만이면 페이지네이션이 없어야 한다
  53  |       await expect(page.getByLabel('페이지 네비게이션')).not.toBeVisible();
  54  |     }
  55  |   });
  56  | 
  57  |   test('게시글이 없을 때 빈 상태 안내 문구가 표시된다', async ({ page }) => {
  58  |     // 검색어로 없는 키워드 검색 → 빈 상태 확인
  59  |     await page.goto('/?q=존재하지않는키워드xyz12345');
  60  |     await expect(page.getByText('검색 결과가 없습니다')).toBeVisible();
  61  |   });
  62  | });
  63  | 
  64  | // BDD: Feature: 게시글 상세 조회
  65  | test.describe('게시글 상세 조회', () => {
  66  |   test('제목 클릭 시 상세 페이지로 이동한다', async ({ page }) => {
  67  |     await page.goto('/');
  68  |     const firstLink = page.locator('tbody tr').first().getByRole('link');
> 69  |     const href = await firstLink.getAttribute('href');
      |                                  ^ Error: locator.getAttribute: Test timeout of 30000ms exceeded.
  70  |     if (href) {
  71  |       await firstLink.click();
  72  |       await expect(page).toHaveURL(/\/posts\/\d+/);
  73  |       // 제목, 본문, 닉네임, 작성일, 조회수가 표시되는지 확인
  74  |       await expect(page.locator('article')).toBeVisible();
  75  |     }
  76  |   });
  77  | 
  78  |   test('상세 페이지 진입 시 조회수가 1 증가한다', async ({ page }) => {
  79  |     const post = await createTestPost(page, { title: '조회수 테스트글' });
  80  |     await page.goto(`/posts/${post.id}`);
  81  |     // 조회수 1 표시 확인
  82  |     await expect(page.getByText('조회수: 1')).toBeVisible();
  83  |   });
  84  | 
  85  |   test('삭제된 게시글에 접근하면 "삭제된 게시글입니다" 표시된다', async ({ page }) => {
  86  |     // 게시글 생성 후 삭제
  87  |     const post = await createTestPost(page, { title: '삭제될 게시글', password: 'del1234' });
  88  |     await page.request.delete(`http://localhost:4000/posts/${post.id}`, {
  89  |       data: { password: 'del1234' },
  90  |     });
  91  |     await page.goto(`/posts/${post.id}`);
  92  |     await expect(page.getByText('삭제된 게시글입니다')).toBeVisible();
  93  |   });
  94  | 
  95  |   test('존재하지 않는 게시글에 접근하면 "존재하지 않는 게시글입니다" 표시된다', async ({ page }) => {
  96  |     await page.goto('/posts/999999999');
  97  |     await expect(page.getByText('존재하지 않는 게시글입니다')).toBeVisible();
  98  |   });
  99  | });
  100 | 
  101 | // BDD: Feature: 게시글 작성
  102 | test.describe('게시글 작성', () => {
  103 |   test('정상 입력 시 게시글이 등록되고 상세 페이지로 이동한다', async ({ page }) => {
  104 |     await page.goto('/posts/new');
  105 |     await page.getByLabel('닉네임').fill('홍길동');
  106 |     await page.getByLabel('비밀번호').fill('1234');
  107 |     await page.getByLabel('제목').fill('첫 번째 글');
  108 |     await page.getByLabel('본문').fill('안녕하세요');
  109 |     await page.getByRole('button', { name: '등록' }).click();
  110 |     await expect(page).toHaveURL(/\/posts\/\d+/);
  111 |     await expect(page.getByText('첫 번째 글')).toBeVisible();
  112 |   });
  113 | 
  114 |   test('제목 미입력 시 에러 메시지가 표시된다', async ({ page }) => {
  115 |     await page.goto('/posts/new');
  116 |     await page.getByRole('button', { name: '등록' }).click();
  117 |     await expect(page.getByText('제목을 입력해 주세요')).toBeVisible();
  118 |   });
  119 | 
  120 |   test('닉네임 1자 입력 시 에러 메시지가 표시된다', async ({ page }) => {
  121 |     await page.goto('/posts/new');
  122 |     await page.getByLabel('닉네임').fill('홍');
  123 |     await page.getByRole('button', { name: '등록' }).click();
  124 |     await expect(page.getByText('닉네임은 2자 이상이어야 합니다')).toBeVisible();
  125 |   });
  126 | 
  127 |   test('비밀번호 3자 입력 시 에러 메시지가 표시된다', async ({ page }) => {
  128 |     await page.goto('/posts/new');
  129 |     await page.getByLabel('비밀번호').fill('123');
  130 |     await page.getByRole('button', { name: '등록' }).click();
  131 |     await expect(page.getByText('비밀번호는 4자 이상이어야 합니다')).toBeVisible();
  132 |   });
  133 | });
  134 | 
  135 | // BDD: Feature: 게시글 수정
  136 | test.describe('게시글 수정', () => {
  137 |   test('올바른 비밀번호 입력 시 수정이 완료된다', async ({ page }) => {
  138 |     const post = await createTestPost(page, {
  139 |       title: '수정 전 제목',
  140 |       password: '1234',
  141 |       nickname: '홍길동',
  142 |     });
  143 |     await page.goto(`/posts/${post.id}`);
  144 |     await page.getByRole('button', { name: '수정' }).click();
  145 |     await expect(page.getByRole('dialog')).toBeVisible();
  146 |     await page.getByLabel('비밀번호').fill('1234');
  147 |     await page.getByRole('button', { name: '확인' }).click();
  148 |     await expect(page).toHaveURL(`/posts/${post.id}/edit`);
  149 |     await page.getByLabel('제목').clear();
  150 |     await page.getByLabel('제목').fill('수정된 제목');
  151 |     await page.getByRole('button', { name: '저장' }).click();
  152 |     await expect(page).toHaveURL(`/posts/${post.id}`);
  153 |     await expect(page.getByText('수정된 제목')).toBeVisible();
  154 |   });
  155 | 
  156 |   test('비밀번호 불일치 시 에러 메시지가 표시된다', async ({ page }) => {
  157 |     const post = await createTestPost(page, { password: '1234' });
  158 |     await page.goto(`/posts/${post.id}`);
  159 |     await page.getByRole('button', { name: '수정' }).click();
  160 |     await expect(page.getByRole('dialog')).toBeVisible();
  161 |     await page.getByLabel('비밀번호').fill('0000');
  162 |     await page.getByRole('button', { name: '확인' }).click();
  163 |     // 비밀번호 불일치: 모달에서 바로 에러 메시지 표시, 페이지 이동 없음
  164 |     await expect(page.getByText('비밀번호가 일치하지 않습니다')).toBeVisible();
  165 |     await expect(page).toHaveURL(`/posts/${post.id}`);
  166 |   });
  167 | 
  168 |   test('비밀번호 모달에서 취소 버튼 클릭 시 모달이 닫힌다', async ({ page }) => {
  169 |     const post = await createTestPost(page);
```