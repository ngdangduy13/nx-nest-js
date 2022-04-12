import { createMiddlewareDecorator, NextFunction, UnauthorizedException } from "@storyofams/next-api-decorators";
import { NextApiRequest, NextApiResponse } from "next";
import jwt, { JwtPayload } from 'jsonwebtoken';
import { getConfig } from "@api/utils";

export const AuthGuard = createMiddlewareDecorator(
  (req: NextApiRequest, res: NextApiResponse, next: NextFunction) => {
    try {
      const authorization = req.headers.authorization;
      const token = authorization.split('Bearer ')[1];
      const decoded = jwt.verify(token, getConfig('TOKEN_SECRET')) as JwtPayload;
      req.headers["user-id"] = decoded.data.uid;
      return next();
    } catch (err) {
      return next(new UnauthorizedException(err));
    }
  }
);
