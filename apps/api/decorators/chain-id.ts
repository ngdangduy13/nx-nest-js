import { createParamDecorator } from '@storyofams/next-api-decorators';

export const ChainId = createParamDecorator<string | undefined>(
  req => req.headers['chain'] as string
);
