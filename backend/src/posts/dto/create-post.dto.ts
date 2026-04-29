import { IsString, MinLength, MaxLength, IsNotEmpty } from 'class-validator';

export class CreatePostDto {
  @IsString()
  @IsNotEmpty({ message: '닉네임을 입력해 주세요' })
  @MinLength(2, { message: '닉네임은 2자 이상이어야 합니다' })
  @MaxLength(20, { message: '닉네임은 20자 이하이어야 합니다' })
  nickname: string;

  @IsString()
  @IsNotEmpty({ message: '비밀번호를 입력해 주세요' })
  @MinLength(4, { message: '비밀번호는 4자 이상이어야 합니다' })
  password: string;

  @IsString()
  @IsNotEmpty({ message: '제목을 입력해 주세요' })
  @MinLength(1, { message: '제목은 1자 이상이어야 합니다' })
  @MaxLength(100, { message: '제목은 100자 이하이어야 합니다' })
  title: string;

  @IsString()
  @IsNotEmpty({ message: '본문을 입력해 주세요' })
  @MinLength(1, { message: '본문은 1자 이상이어야 합니다' })
  @MaxLength(5000, { message: '본문은 5,000자 이하이어야 합니다' })
  body: string;
}
