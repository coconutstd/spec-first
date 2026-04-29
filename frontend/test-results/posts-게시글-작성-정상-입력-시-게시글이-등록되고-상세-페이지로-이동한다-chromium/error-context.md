# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: posts.spec.ts >> 게시글 작성 >> 정상 입력 시 게시글이 등록되고 상세 페이지로 이동한다
- Location: e2e/posts.spec.ts:103:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByText('첫 번째 글')
Expected: visible
Error: strict mode violation: getByText('첫 번째 글') resolved to 2 elements:
    1) <h1 class="text-2xl font-bold text-gray-900 mb-3">첫 번째 글</h1> aka getByRole('heading', { name: '첫 번째 글' })
    2) <div role="alert" aria-live="assertive" id="__next-route-announcer__">첫 번째 글 | 게시판</div> aka getByText('첫 번째 글 | 게시판')

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for getByText('첫 번째 글')

```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - banner [ref=e2]:
    - link "게시판" [ref=e4] [cursor=pointer]:
      - /url: /
  - main [ref=e5]:
    - generic [ref=e6]:
      - link "← 목록으로" [ref=e8] [cursor=pointer]:
        - /url: /
      - article [ref=e10]:
        - generic [ref=e11]:
          - heading "첫 번째 글" [level=1] [ref=e12]
          - generic [ref=e13]:
            - generic [ref=e14]: "작성자: 홍길동"
            - generic [ref=e15]: "작성일: 2026. 04. 29. 오전 06:22"
            - generic [ref=e16]: "조회수: 1"
        - generic [ref=e17]: 안녕하세요
        - generic [ref=e18]:
          - button "수정" [ref=e19]
          - button "삭제" [ref=e20]
        - region "댓글" [ref=e21]:
          - heading "댓글" [level=2] [ref=e22]
          - paragraph [ref=e23]: 아직 댓글이 없습니다.
          - generic [ref=e24]:
            - heading "댓글 작성" [level=3] [ref=e25]
            - generic [ref=e26]:
              - generic [ref=e27]:
                - generic [ref=e28]:
                  - generic [ref=e29]: 닉네임
                  - textbox "닉네임" [ref=e30]:
                    - /placeholder: 2~20자
                - generic [ref=e31]:
                  - generic [ref=e32]: 비밀번호
                  - textbox "비밀번호" [ref=e33]:
                    - /placeholder: 4자 이상
              - generic [ref=e34]:
                - generic [ref=e35]: 내용
                - textbox "내용" [ref=e36]:
                  - /placeholder: 댓글을 입력해 주세요 (1~500자)
              - button "댓글 등록" [ref=e38]
  - contentinfo [ref=e39]:
    - generic [ref=e40]: 단순 게시판 서비스
  - button "Open Next.js Dev Tools" [ref=e46] [cursor=pointer]:
    - img [ref=e47]
  - alert [ref=e50]: 첫 번째 글 | 게시판
```

# Test source

```ts
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
  69  |     const href = await firstLink.getAttribute('href');
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
> 111 |     await expect(page.getByText('첫 번째 글')).toBeVisible();
      |                                            ^ Error: expect(locator).toBeVisible() failed
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
  170 |     await page.goto(`/posts/${post.id}`);
  171 |     await page.getByRole('button', { name: '수정' }).click();
  172 |     await expect(page.getByRole('dialog')).toBeVisible();
  173 |     await page.getByRole('button', { name: '취소' }).click();
  174 |     await expect(page.getByRole('dialog')).not.toBeVisible();
  175 |     await expect(page).toHaveURL(`/posts/${post.id}`);
  176 |   });
  177 | 
  178 |   test('/posts/:id/edit 직접 접근 시 상세 페이지로 리다이렉트된다', async ({ page }) => {
  179 |     await page.goto('/posts/1/edit');
  180 |     await expect(page).toHaveURL('/posts/1');
  181 |   });
  182 | });
  183 | 
  184 | // BDD: Feature: 게시글 삭제
  185 | test.describe('게시글 삭제', () => {
  186 |   test('올바른 비밀번호 입력 시 글이 삭제되고 목록으로 이동한다', async ({ page }) => {
  187 |     const post = await createTestPost(page, { title: '삭제 테스트', password: '1234' });
  188 |     await page.goto(`/posts/${post.id}`);
  189 |     await page.getByRole('button', { name: '삭제' }).click();
  190 |     await expect(page.getByRole('dialog')).toBeVisible();
  191 |     await page.getByLabel('비밀번호').fill('1234');
  192 |     await page.getByRole('button', { name: '확인' }).click();
  193 |     await expect(page).toHaveURL('/');
  194 |   });
  195 | 
  196 |   test('비밀번호 불일치 시 삭제되지 않는다', async ({ page }) => {
  197 |     const post = await createTestPost(page, { title: '삭제 실패 테스트', password: '1234' });
  198 |     await page.goto(`/posts/${post.id}`);
  199 |     await page.getByRole('button', { name: '삭제' }).click();
  200 |     await page.getByLabel('비밀번호').fill('9999');
  201 |     await page.getByRole('button', { name: '확인' }).click();
  202 |     await expect(page.getByText('비밀번호가 일치하지 않습니다')).toBeVisible();
  203 |     await expect(page).toHaveURL(`/posts/${post.id}`);
  204 |   });
  205 | });
  206 | 
  207 | // BDD: Feature: 키워드 검색
  208 | test.describe('키워드 검색', () => {
  209 |   test('키워드 검색 시 관련 게시글만 표시된다', async ({ page }) => {
  210 |     await page.goto('/');
  211 |     await page.getByRole('searchbox').fill('NestJS');
```