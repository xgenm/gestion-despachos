import { Request, Response, NextFunction } from 'express';
declare const authenticateToken: (req: Request, res: Response, next: NextFunction) => void | Response<any, Record<string, any>>;
export default authenticateToken;
//# sourceMappingURL=authMiddleware.d.ts.map