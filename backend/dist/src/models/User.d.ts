export interface User {
    id: number;
    username: string;
    password: string;
    role: string;
    created_by?: number;
    created_at?: Date;
}
export declare class UserModel {
    static createTable(): Promise<void>;
    static createUser(username: string, password: string, role?: string, createdBy?: number): Promise<User>;
    static findByUsername(username: string): Promise<User | null>;
    static validatePassword(user: User, password: string): Promise<boolean>;
    static getAllUsers(): Promise<User[]>;
    static deleteUser(id: number): Promise<boolean>;
}
//# sourceMappingURL=User.d.ts.map