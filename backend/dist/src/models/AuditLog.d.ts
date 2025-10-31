export interface AuditLog {
    id: number;
    user_id: number;
    username: string;
    action: string;
    entity_type: string;
    entity_id?: number;
    details?: string;
    ip_address?: string;
    created_at: Date;
}
export declare class AuditLogModel {
    static createTable(): Promise<void>;
    static log(userId: number, username: string, action: string, entityType: string, entityId?: number, details?: any, ipAddress?: string): Promise<void>;
    static getRecentLogs(limit?: number): Promise<AuditLog[]>;
    static getLogsByUser(userId: number, limit?: number): Promise<AuditLog[]>;
    static getLogsByEntity(entityType: string, entityId: number): Promise<AuditLog[]>;
}
//# sourceMappingURL=AuditLog.d.ts.map