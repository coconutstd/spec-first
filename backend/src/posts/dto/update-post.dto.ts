import { IsString, MinLength, MaxLength, IsOptional, IsNotEmpty } from 'class-validator';

export class UpdatePostDto {
  @IsString()
  @IsNotEmpty({ message: '비밀번호를 입력해 주세요' })
  password: string;

  @IsOptional()
  @IsString()
  @MinLength(1, { message: '제목은 1자 이상이어야 합니다' })
  @MaxLength(100, { message: '제목은 100자 이하이어야 합니다' })
  title?: string;

  @IsOptional()
  @IsString()
  @MinLength(1, { message: '본문은 1자 이상이어야 합니다' })
  @MaxLength(5000, { message: '본문은 5,000자 이하이어야 합니다' })
  body?: string;
}
