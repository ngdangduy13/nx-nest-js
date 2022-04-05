
import { IsString } from 'class-validator';

export class SignInRequest {
  @IsString()
  message: string;

  @IsString()
  signature: string;
}
