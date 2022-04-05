import {
  Body,
  createHandler,
  Post,
  ValidationPipe,
} from '@storyofams/next-api-decorators';
import { IsNotEmpty, IsEmail } from 'class-validator';

export class CreateUserDTO {
  @IsEmail()
  email: string;

  @IsNotEmpty()
  fullName: string;
}

class UserHandler {
  @Post()
  createUser(@Body(ValidationPipe) body: CreateUserDTO) {
    return body;
  }
}

export default createHandler(UserHandler);
