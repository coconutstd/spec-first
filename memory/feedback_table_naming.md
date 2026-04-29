---
name: 테이블명 단수형 사용
description: DB 테이블명은 복수형이 아닌 단수형으로 지어야 한다
type: feedback
---

테이블명은 단수형으로 짓는다 (예: `post`, `comment` — `posts`, `comments` 아님).

**Why:** 사용자가 복수형 테이블명을 명시적으로 거부했다.

**How to apply:** ERD, 마이그레이션, 엔티티 등 DB 스키마를 작성할 때 항상 단수형 테이블명을 사용한다.
