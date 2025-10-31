import { Request, Response, NextFunction } from 'express';
interface AuthRequest extends Request {
    user?: {
        id: number;
        username: string;
        role: string;
    };
}
export declare const auditLog: (entityType: string) => (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const logManualAction: (userId: number, username: string, action: string, entityType: string, entityId?: number, details?: any, req?: Request) => Promise<void>;
export {};
//# sourceMappingURL=auditMiddleware.d.ts.map