import { IsString, IsNotEmpty } from 'class-validator';

export class DeletePostDto {
  @IsString()
  @IsNotEmpty({ message: '비밀번호를 입력해 주세요' })
  password: string;
}
