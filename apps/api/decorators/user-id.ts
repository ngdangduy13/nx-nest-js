import { createParamDecorator } from '@storyofams/next-api-decorators';

export const UserId = createParamDecorator<string | undefined>(
  req => req.headers['user-id'] as string
);
