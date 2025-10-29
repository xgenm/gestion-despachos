import { Request, Response, NextFunction } from 'express';
declare const checkRole: (requiredRole: string) => (req: Request, res: Response, next: NextFunction) => void | Response<any, Record<string, any>>;
export default checkRole;
//# sourceMappingURL=roleMiddleware.d.ts.map