import { createMiddlewareDecorator, NextFunction, UnauthorizedException } from "@storyofams/next-api-decorators";
import { NextApiRequest, NextApiResponse } from "next";
import jwt, { JwtPayload } from 'jsonwebtoken';
import { getConfig } from "@api/utils";

export type Session = {
  uid: string;
}

export type NextApiRequestWithSession = NextApiRequest & {
  session: Session
}

export const AuthGuard = createMiddlewareDecorator(
  (req: NextApiRequestWithSession, res: NextApiResponse, next: NextFunction) => {
    try {
      const authorization = req.headers.authorization;
      if (authorization && authorization.startsWith('Bearer ')) {
        const token = authorization.split('Bearer ')[1];
        const decoded = jwt.verify(token, getConfig('TOKEN_SECRET')) as JwtPayload;
        req.headers["user-id"] = decoded.data.uid;
      }
    } catch(err) {
      return next(new UnauthorizedException(err));
    }
    next();
  }
);
