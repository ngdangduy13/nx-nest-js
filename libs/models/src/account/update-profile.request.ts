import { IsArray, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class LinkModel {
  @IsString()
  type: string;

  @IsString()
  url: string;
}

export class UpdateProfileRequest {
  @IsString()
  displayName: string;

  @IsString()
  @IsOptional()
  image: string;

  @IsString()
  @IsOptional()
  cover: string;

  @IsString()
  @IsOptional()
  video: string;

  @IsString()
  @IsOptional()
  bio: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LinkModel)
  @IsOptional()
  links: LinkModel[];
}
