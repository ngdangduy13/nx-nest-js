
import { IsString } from 'class-validator';

export class CreateCollectionRequest {
  @IsString()
  chain: string;

  @IsString()
  contract: string;
}
