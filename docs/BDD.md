# BDD 시나리오: 단순 게시판 서비스

**기준 PRD:** PRD.md v1.0  
**작성일:** 2026-04-29

---

## 목차

- [프론트엔드 BDD](#프론트엔드-bdd)
- [백엔드 BDD](#백엔드-bdd)

---

# 프론트엔드 BDD

> 도구: Playwright (E2E)  
> 기준 URL: `http://localhost:3000`

---

## Feature: 게시글 목록 조회

```gherkin
Feature: 게시글 목록 조회

  Background:
    Given 게시글이 3개 이상 등록되어 있다

  Scenario: 목록 페이지 진입 시 게시글이 표시된다
    When 사용자가 "/" 경로에 접속한다
    Then 게시글 목록이 보인다
    And 각 행에 번호, 제목, 닉네임, 작성일, 조회수, 댓글수가 표시된다

  Scenario: 목록은 최신순으로 정렬된다
    When 사용자가 "/" 경로에 접속한다
    Then 가장 최근에 작성된 글이 목록 맨 위에 표시된다

  Scenario: 페이지당 20건 초과 시 페이지네이션이 나타난다
    Given 게시글이 21개 이상 등록되어 있다
    When 사용자가 "/" 경로에 접속한다
    Then 페이지네이션 컨트롤이 표시된다
    And "다음" 버튼을 클릭하면 다음 페이지의 글 목록이 표시된다
```

---

## Feature: 게시글 상세 조회

```gherkin
Feature: 게시글 상세 조회

  Background:
    Given id가 1인 게시글이 존재한다

  Scenario: 제목 클릭 시 상세 페이지로 이동한다
    When 사용자가 목록에서 게시글 제목을 클릭한다
    Then "/posts/1" 경로로 이동한다
    And 제목, 본문, 닉네임, 작성일, 조회수가 표시된다

  Scenario: 상세 페이지 진입 시 조회수가 1 증가한다
    Given 해당 게시글의 조회수가 5이다
    When 사용자가 "/posts/1"에 접속한다
    Then 조회수가 6으로 표시된다

  Scenario: 삭제된 게시글에 접근하면 안내 메시지가 표시된다
    Given id가 99인 게시글이 삭제되어 있다
    When 사용자가 "/posts/99"에 접속한다
    Then "삭제된 게시글입니다" 안내 문구가 표시된다

  Scenario: 존재하지 않는 게시글에 접근하면 안내 메시지가 표시된다
    When 사용자가 "/posts/99999"에 접속한다
    Then "존재하지 않는 게시글입니다" 안내 문구가 표시된다
```

---

## Feature: 게시글 작성

```gherkin
Feature: 게시글 작성

  Scenario: 정상 입력 시 게시글이 등록되고 상세 페이지로 이동한다
    Given 사용자가 "/posts/new"에 접속한다
    When 닉네임에 "홍길동"을 입력한다
    And 비밀번호에 "1234"를 입력한다
    And 제목에 "첫 번째 글"을 입력한다
    And 본문에 "안녕하세요"를 입력한다
    And "등록" 버튼을 클릭한다
    Then 새로 생성된 게시글 상세 페이지로 이동한다
    And 제목 "첫 번째 글"이 표시된다

  Scenario: 필수 항목 미입력 시 에러 메시지가 표시된다
    Given 사용자가 "/posts/new"에 접속한다
    When 제목을 비워두고 "등록" 버튼을 클릭한다
    Then "제목을 입력해 주세요" 에러 메시지가 표시된다
    And 페이지 이동이 발생하지 않는다

  Scenario: 닉네임이 1자인 경우 에러 메시지가 표시된다
    Given 사용자가 "/posts/new"에 접속한다
    When 닉네임에 "홍"을 입력하고 "등록" 버튼을 클릭한다
    Then "닉네임은 2자 이상이어야 합니다" 에러 메시지가 표시된다

  Scenario: 비밀번호가 3자인 경우 에러 메시지가 표시된다
    Given 사용자가 "/posts/new"에 접속한다
    When 비밀번호에 "123"을 입력하고 "등록" 버튼을 클릭한다
    Then "비밀번호는 4자 이상이어야 합니다" 에러 메시지가 표시된다
```

---

## Feature: 게시글 수정

```gherkin
Feature: 게시글 수정

  Background:
    Given 닉네임 "홍길동", 비밀번호 "1234"로 작성된 게시글이 "/posts/1"에 존재한다

  Scenario: 올바른 비밀번호 입력 시 수정이 완료된다
    When 사용자가 "/posts/1"에서 "수정" 버튼을 클릭한다
    Then 비밀번호 입력 모달이 표시된다
    When "1234"를 입력하고 확인 버튼을 클릭한다
    Then "/posts/1/edit" 페이지로 이동한다
    When 제목을 "수정된 제목"으로 변경하고 "저장" 버튼을 클릭한다
    Then "/posts/1" 페이지로 이동한다
    And 제목이 "수정된 제목"으로 표시된다

  Scenario: 비밀번호 불일치 시 에러 메시지가 표시된다
    When 사용자가 "/posts/1"에서 "수정" 버튼을 클릭한다
    And "0000"을 입력하고 확인 버튼을 클릭한다
    Then "비밀번호가 일치하지 않습니다" 에러 메시지가 표시된다
    And 수정 페이지로 이동하지 않는다

  Scenario: 비밀번호 모달에서 취소 버튼 클릭 시 모달이 닫힌다
    When 사용자가 "/posts/1"에서 "수정" 버튼을 클릭한다
    Then 비밀번호 입력 모달이 표시된다
    When 취소 버튼을 클릭한다
    Then 모달이 닫히고 "/posts/1" 페이지가 유지된다

  Scenario: 수정 페이지 직접 URL 접근 시 상세 페이지로 리다이렉트된다
    When 사용자가 비밀번호 검증 없이 "/posts/1/edit"에 직접 접속한다
    Then "/posts/1" 페이지로 리다이렉트된다
```

---

## Feature: 게시글 삭제

```gherkin
Feature: 게시글 삭제

  Background:
    Given 닉네임 "홍길동", 비밀번호 "1234"로 작성된 게시글이 "/posts/1"에 존재한다

  Scenario: 올바른 비밀번호 입력 시 글이 삭제되고 목록으로 이동한다
    When 사용자가 "/posts/1"에서 "삭제" 버튼을 클릭한다
    Then 비밀번호 입력 모달이 표시된다
    When "1234"를 입력하고 확인 버튼을 클릭한다
    Then "/" 목록 페이지로 이동한다
    And 삭제된 게시글이 목록에 표시되지 않는다

  Scenario: 게시글 삭제 시 달린 댓글도 함께 삭제된다
    Given "/posts/1"에 댓글이 3개 달려 있다
    When 올바른 비밀번호로 게시글을 삭제한다
    Then "/" 목록 페이지로 이동한다
    And 삭제된 게시글의 URL("/posts/1")에 접근하면 "삭제된 게시글입니다"가 표시된다

  Scenario: 비밀번호 불일치 시 삭제가 되지 않는다
    When 사용자가 "/posts/1"에서 "삭제" 버튼을 클릭한다
    And "9999"를 입력하고 확인 버튼을 클릭한다
    Then "비밀번호가 일치하지 않습니다" 에러 메시지가 표시된다
    And 게시글이 목록에 여전히 표시된다

  Scenario: 삭제 모달에서 취소 버튼 클릭 시 모달이 닫힌다
    When 사용자가 "/posts/1"에서 "삭제" 버튼을 클릭한다
    Then 비밀번호 입력 모달이 표시된다
    When 취소 버튼을 클릭한다
    Then 모달이 닫히고 "/posts/1" 페이지가 유지된다
```

---

## Feature: 댓글

```gherkin
Feature: 댓글

  Background:
    Given id가 1인 게시글 상세 페이지에 접속해 있다

  Scenario: 댓글을 작성하면 목록에 즉시 표시된다
    When 닉네임에 "댓글러"를 입력한다
    And 비밀번호에 "pass"를 입력한다
    And 내용에 "좋은 글이네요"를 입력한다
    And "댓글 등록" 버튼을 클릭한다
    Then 댓글 목록에 "좋은 글이네요"가 표시된다
    And 게시글의 댓글수가 1 증가한다

  Scenario: 댓글 내용 미입력 시 에러 메시지가 표시된다
    When 내용을 비워두고 "댓글 등록" 버튼을 클릭한다
    Then "댓글 내용을 입력해 주세요" 에러 메시지가 표시된다

  Scenario: 올바른 비밀번호로 댓글을 삭제한다
    Given 비밀번호 "pass"로 작성된 댓글이 존재한다
    When 해당 댓글의 "삭제" 버튼을 클릭한다
    And 비밀번호 모달에 "pass"를 입력하고 확인한다
    Then 해당 댓글이 목록에서 사라진다

  Scenario: 댓글 닉네임이 1자인 경우 에러 메시지가 표시된다
    When 닉네임에 "홍"을 입력하고 "댓글 등록" 버튼을 클릭한다
    Then "닉네임은 2자 이상이어야 합니다" 에러 메시지가 표시된다

  Scenario: 댓글 비밀번호가 3자인 경우 에러 메시지가 표시된다
    When 비밀번호에 "123"을 입력하고 "댓글 등록" 버튼을 클릭한다
    Then "비밀번호는 4자 이상이어야 합니다" 에러 메시지가 표시된다
```

---

## Feature: 키워드 검색

```gherkin
Feature: 키워드 검색

  Background:
    Given 제목에 "NestJS"가 포함된 게시글 2건과 관련 없는 게시글 3건이 존재한다

  Scenario: 키워드 검색 시 관련 게시글만 표시된다
    When 검색창에 "NestJS"를 입력하고 검색 버튼을 클릭한다
    Then URL이 "/?q=NestJS"로 변경된다
    And 검색 결과에 2건의 게시글이 표시된다
    And 표시된 게시글의 제목 또는 본문에 "NestJS"가 포함되어 있다

  Scenario: 검색 결과가 없는 경우 안내 메시지가 표시된다
    When 검색창에 "존재하지않는키워드xyz"를 입력하고 검색 버튼을 클릭한다
    Then "검색 결과가 없습니다" 메시지가 표시된다

  Scenario: 빈 검색어로 검색하면 전체 목록이 표시된다
    When 검색창을 비워두고 검색 버튼을 클릭한다
    Then URL이 "/"로 변경된다
    And 전체 게시글 목록이 표시된다

  Scenario: 검색 결과가 21건 이상이면 페이지네이션이 표시된다
    Given "NestJS"가 포함된 게시글이 21건 존재한다
    When 검색창에 "NestJS"를 입력하고 검색 버튼을 클릭한다
    Then 검색 결과 20건이 표시된다
    And 페이지네이션 컨트롤이 표시된다
    And "다음" 버튼을 클릭하면 나머지 1건이 표시된다
```

---

## Feature: 빈 상태

```gherkin
Feature: 빈 상태

  Scenario: 게시글이 없을 때 목록 페이지에 안내 문구가 표시된다
    Given 등록된 게시글이 없다
    When 사용자가 "/" 경로에 접속한다
    Then "아직 게시글이 없습니다" 안내 문구가 표시된다

  Scenario: 검색 결과가 없을 때 안내 문구가 표시된다
    When 검색창에 "존재하지않는키워드xyz"를 입력하고 검색 버튼을 클릭한다
    Then "검색 결과가 없습니다" 메시지가 표시된다
```

---

## Feature: 반응형 레이아웃

```gherkin
Feature: 반응형 레이아웃

  Scenario: 모바일(375px) 뷰포트에서 게시글 목록이 깨지지 않는다
    Given 브라우저 뷰포트가 375 x 812로 설정되어 있다
    When 사용자가 "/" 경로에 접속한다
    Then 모든 열이 화면 밖으로 벗어나지 않는다
    And 가로 스크롤바가 생기지 않는다

  Scenario: 모바일에서 게시글 작성 폼이 정상적으로 표시된다
    Given 브라우저 뷰포트가 375 x 812로 설정되어 있다
    When 사용자가 "/posts/new"에 접속한다
    Then 닉네임, 비밀번호, 제목, 본문 입력 필드와 등록 버튼이 모두 보인다
```

---

# 백엔드 BDD

> 도구: Supertest (통합 테스트) + Jest  
> 기준: REST API

---

## Feature: 게시글 목록 API

```gherkin
Feature: GET /posts — 게시글 목록 조회

  Scenario: 기본 호출 시 최신순 20건을 반환한다
    Given 게시글 25건이 저장되어 있다
    When GET /posts 요청을 보낸다
    Then 상태 코드 200을 반환한다
    And 응답 body의 data 배열 길이가 20이다
    And 첫 번째 항목이 가장 최근에 생성된 게시글이다
    And 각 항목에 id, title, nickname, viewCount, commentCount, createdAt 필드가 있다

  Scenario: page 파라미터로 다음 페이지를 조회한다
    Given 게시글 25건이 저장되어 있다
    When GET /posts?page=2 요청을 보낸다
    Then 상태 코드 200을 반환한다
    And 응답 body의 data 배열 길이가 5이다

  Scenario: 삭제된 게시글은 목록에 포함되지 않는다
    Given is_deleted=true인 게시글이 존재한다
    When GET /posts 요청을 보낸다
    Then 해당 게시글이 응답에 포함되지 않는다
```

---

## Feature: 게시글 상세 API

```gherkin
Feature: GET /posts/:id — 게시글 상세 조회

  Scenario: 존재하는 게시글을 조회하면 상세 정보를 반환한다
    Given id=1인 게시글이 존재한다
    When GET /posts/1 요청을 보낸다
    Then 상태 코드 200을 반환한다
    And 응답에 id, title, body, nickname, viewCount, createdAt 필드가 있다

  Scenario: 조회할 때마다 viewCount가 1 증가한다
    Given id=1인 게시글의 viewCount가 5이다
    When GET /posts/1 요청을 두 번 보낸다
    Then 두 번째 응답의 viewCount가 7이다

  Scenario: 삭제된 게시글 조회 시 404와 구분자를 반환한다
    Given id=2인 게시글이 소프트 삭제되어 있다
    When GET /posts/2 요청을 보낸다
    Then 상태 코드 404를 반환한다
    And 응답 body의 code가 "POST_DELETED"이다

  Scenario: 존재하지 않는 게시글 조회 시 404와 구분자를 반환한다
    When GET /posts/99999 요청을 보낸다
    Then 상태 코드 404를 반환한다
    And 응답 body의 code가 "POST_NOT_FOUND"이다
```

---

## Feature: 게시글 작성 API

```gherkin
Feature: POST /posts — 게시글 작성

  Scenario: 정상 입력 시 게시글이 생성된다
    When POST /posts 요청을 아래 body로 보낸다
      | nickname | 홍길동     |
      | password | 1234       |
      | title    | 테스트 제목 |
      | body     | 테스트 본문 |
    Then 상태 코드 201을 반환한다
    And 응답에 생성된 게시글의 id가 포함된다
    And DB에 password_hash가 bcrypt 형식으로 저장된다
    And DB에 평문 비밀번호가 저장되지 않는다

  Scenario: 닉네임 누락 시 400을 반환한다
    When POST /posts 요청을 nickname 없이 보낸다
    Then 상태 코드 400을 반환한다
    And 응답에 "nickname" 필드 관련 에러 메시지가 포함된다

  Scenario: 닉네임 1자 입력 시 400을 반환한다
    When POST /posts 요청에서 nickname을 "홍"으로 보낸다
    Then 상태 코드 400을 반환한다

  Scenario: 비밀번호 3자 입력 시 400을 반환한다
    When POST /posts 요청에서 password를 "123"으로 보낸다
    Then 상태 코드 400을 반환한다

  Scenario: 제목 100자 초과 시 400을 반환한다
    When POST /posts 요청에서 title을 101자 문자열로 보낸다
    Then 상태 코드 400을 반환한다

  Scenario: 본문 5000자 초과 시 400을 반환한다
    When POST /posts 요청에서 body를 5001자 문자열로 보낸다
    Then 상태 코드 400을 반환한다
```

---

## Feature: 게시글 수정 API

```gherkin
Feature: PATCH /posts/:id — 게시글 수정

  Scenario: 올바른 비밀번호로 제목과 본문을 수정하면 내용이 변경된다
    Given id=1인 게시글이 비밀번호 "1234"로 작성되어 있다
    When PATCH /posts/1 요청을 아래 body로 보낸다
      | password | 1234       |
      | title    | 수정된 제목 |
      | body     | 수정된 본문 |
    Then 상태 코드 200을 반환한다
    And 응답의 title이 "수정된 제목"이다
    And 응답의 body가 "수정된 본문"이다
    And DB에서 updatedAt이 갱신된다

  Scenario: 비밀번호 불일치 시 403을 반환한다
    Given id=1인 게시글이 비밀번호 "1234"로 작성되어 있다
    When PATCH /posts/1 요청에서 password를 "0000"으로 보낸다
    Then 상태 코드 403을 반환한다

  Scenario: 존재하지 않는 게시글 수정 시 404를 반환한다
    When PATCH /posts/99999 요청을 보낸다
    Then 상태 코드 404를 반환한다
```

---

## Feature: 게시글 삭제 API

```gherkin
Feature: DELETE /posts/:id — 게시글 삭제

  Scenario: 올바른 비밀번호로 삭제하면 게시글과 댓글이 소프트 삭제된다
    Given id=1인 게시글이 비밀번호 "1234"로 작성되어 있다
    And 해당 게시글에 댓글이 2개 달려 있다
    When DELETE /posts/1 요청을 body { "password": "1234" }로 보낸다
    Then 상태 코드 200을 반환한다
    And DB에서 해당 게시글의 is_deleted가 true이다
    And DB에서 해당 게시글의 댓글 2개의 is_deleted가 true이다
    And GET /posts/1 요청 시 404와 code "POST_DELETED"를 반환한다

  Scenario: 비밀번호 불일치 시 403을 반환한다
    Given id=1인 게시글이 비밀번호 "1234"로 작성되어 있다
    When DELETE /posts/1 요청을 body { "password": "wrong" }로 보낸다
    Then 상태 코드 403을 반환한다
    And DB에서 is_deleted가 false로 유지된다
```

---

## Feature: 댓글 API

```gherkin
Feature: POST /posts/:id/comments — 댓글 작성

  Scenario: 정상 입력 시 댓글이 생성된다
    Given id=1인 게시글이 존재한다
    When POST /posts/1/comments 요청을 아래 body로 보낸다
      | nickname | 댓글러    |
      | password | pass      |
      | body     | 좋은 글! |
    Then 상태 코드 201을 반환한다
    And 응답에 생성된 댓글의 id가 포함된다

  Scenario: 댓글 닉네임 1자 입력 시 400을 반환한다
    When POST /posts/1/comments 요청에서 nickname을 "홍"으로 보낸다
    Then 상태 코드 400을 반환한다

  Scenario: 댓글 비밀번호 3자 입력 시 400을 반환한다
    When POST /posts/1/comments 요청에서 password를 "123"으로 보낸다
    Then 상태 코드 400을 반환한다

  Scenario: 댓글 내용 500자 초과 시 400을 반환한다
    When POST /posts/1/comments 요청에서 body를 501자 문자열로 보낸다
    Then 상태 코드 400을 반환한다

  Scenario: 존재하지 않는 게시글에 댓글 작성 시 404를 반환한다
    When POST /posts/99999/comments 요청을 보낸다
    Then 상태 코드 404를 반환한다

Feature: DELETE /posts/:postId/comments/:commentId — 댓글 삭제

  Scenario: 올바른 비밀번호로 댓글을 삭제한다
    Given id=1인 댓글이 비밀번호 "pass"로 작성되어 있다
    When DELETE /posts/1/comments/1 요청을 body { "password": "pass" }로 보낸다
    Then 상태 코드 200을 반환한다
    And DB에서 해당 댓글의 is_deleted가 true이다

  Scenario: 비밀번호 불일치 시 403을 반환한다
    When DELETE /posts/1/comments/1 요청을 body { "password": "wrong" }로 보낸다
    Then 상태 코드 403을 반환한다
```

---

## Feature: 키워드 검색 API

```gherkin
Feature: GET /posts?q= — 키워드 검색

  Scenario: 키워드가 제목에 포함된 게시글을 반환한다
    Given 제목에 "NestJS"가 포함된 게시글 2건과 관련 없는 게시글 3건이 존재한다
    When GET /posts?q=NestJS 요청을 보낸다
    Then 상태 코드 200을 반환한다
    And data 배열 길이가 2이다
    And 모든 항목의 title 또는 body에 "NestJS"가 포함된다

  Scenario: 키워드가 본문에 포함된 게시글을 반환한다
    Given 본문에 "TypeScript"가 포함된 게시글 1건이 존재한다
    When GET /posts?q=TypeScript 요청을 보낸다
    Then data 배열 길이가 1이다

  Scenario: 일치하는 게시글이 없으면 빈 배열을 반환한다
    When GET /posts?q=존재하지않는키워드xyz 요청을 보낸다
    Then 상태 코드 200을 반환한다
    And data 배열이 비어 있다

  Scenario: 빈 검색어로 요청하면 전체 목록을 반환한다
    Given 게시글 3건이 저장되어 있다
    When GET /posts?q= 요청을 보낸다
    Then 상태 코드 200을 반환한다
    And data 배열 길이가 3이다

  Scenario: 검색 결과가 21건 이상이면 페이지네이션이 적용된다
    Given "NestJS"가 포함된 게시글이 21건 저장되어 있다
    When GET /posts?q=NestJS&page=2 요청을 보낸다
    Then 상태 코드 200을 반환한다
    And data 배열 길이가 1이다
```

---

## Feature: 스팸 방지 (Rate Limit)

```gherkin
Feature: Rate Limit — 분당 IP당 글쓰기 5회 제한

  Scenario: 동일 IP에서 1분 내 6번째 글쓰기 시 429를 반환한다
    Given 동일 IP에서 1분 내 POST /posts 요청을 5번 성공했다
    When 같은 IP에서 6번째 POST /posts 요청을 보낸다
    Then 상태 코드 429를 반환한다
    And 응답에 "요청이 너무 많습니다" 메시지가 포함된다

  Scenario: 1분이 경과하면 다시 글쓰기가 가능하다
    Given 동일 IP에서 1분 내 POST /posts 요청을 5번 했다
    When 1분이 경과한 후 같은 IP에서 POST /posts 요청을 보낸다
    Then 상태 코드 201을 반환한다
```
