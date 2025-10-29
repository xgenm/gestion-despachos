export interface User {
    id: number;
    username: string;
    password: string;
    role: string;
}
export declare class UserModel {
    static createTable(): Promise<void>;
    static createUser(username: string, password: string, role?: string): Promise<User>;
    static findByUsername(username: string): Promise<User | null>;
    static validatePassword(user: User, password: string): Promise<boolean>;
}
//# sourceMappingURL=User.d.ts.map