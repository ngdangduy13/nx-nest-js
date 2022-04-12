import { createParamDecorator, UnauthorizedException } from '@storyofams/next-api-decorators';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { getConfig } from "@api/utils";

export const UserId = createParamDecorator<string | undefined>(
  // req => req.headers['user-id'] as string
  req => {
    try {
      const authorization = req.headers.authorization;
      console.log(authorization);
      if (authorization && authorization.startsWith('Bearer ')) {
        const token = authorization.split('Bearer ')[1];
        const decoded = jwt.verify(token, getConfig('TOKEN_SECRET'), {
          ignoreExpiration: true
        }) as JwtPayload;
        return decoded.data.uid;
      }
    } catch (error) {
      throw new UnauthorizedException(error)
    }
  }
);
