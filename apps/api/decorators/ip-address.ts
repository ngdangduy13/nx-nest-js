import { createParamDecorator } from '@storyofams/next-api-decorators';
import requestIp from 'request-ip';

export const IpAddress = createParamDecorator<string | undefined>(
  req => requestIp.getClientIp(req)
);
