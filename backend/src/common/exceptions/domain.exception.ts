import { HttpException, HttpStatus } from '@nestjs/common';

export class DomainException extends HttpException {
  constructor(
    public readonly code: string,
    message: string,
    statusCode: HttpStatus,
  ) {
    super({ statusCode, code, message }, statusCode);
  }
}

export class PostNotFoundException extends DomainException {
  constructor() {
    super('POST_NOT_FOUND', '존재하지 않는 게시글입니다', HttpStatus.NOT_FOUND);
  }
}

export class PostDeletedException extends DomainException {
  constructor() {
    super('POST_DELETED', '삭제된 게시글입니다', HttpStatus.NOT_FOUND);
  }
}

export class CommentNotFoundException extends DomainException {
  constructor() {
    super('COMMENT_NOT_FOUND', '존재하지 않는 댓글입니다', HttpStatus.NOT_FOUND);
  }
}

export class CommentDeletedException extends DomainException {
  constructor() {
    super('COMMENT_DELETED', '삭제된 댓글입니다', HttpStatus.NOT_FOUND);
  }
}

export class InvalidPasswordException extends DomainException {
  constructor() {
    super('INVALID_PASSWORD', '비밀번호가 일치하지 않습니다', HttpStatus.FORBIDDEN);
  }
}
