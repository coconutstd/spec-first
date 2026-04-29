import { IsString, IsNotEmpty } from 'class-validator';

export class DeleteCommentDto {
  @IsString()
  @IsNotEmpty({ message: '비밀번호를 입력해 주세요' })
  password: string;
}
