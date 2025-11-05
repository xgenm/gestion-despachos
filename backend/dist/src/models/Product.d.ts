export interface Product {
    id: number;
    name: string;
    price: number;
    unit: string;
    active: boolean;
    created_at?: Date;
    updated_at?: Date;
}
export declare class ProductModel {
    static createTable(): Promise<void>;
    static getAllProducts(activeOnly?: boolean): Promise<Product[]>;
    static getProductById(id: number): Promise<Product | null>;
    static createProduct(name: string, price: number, unit?: string): Promise<Product>;
    static updateProduct(id: number, name: string, price: number, unit: string): Promise<Product | null>;
    static deleteProduct(id: number): Promise<boolean>;
    static activateProduct(id: number): Promise<boolean>;
}
//# sourceMappingURL=Product.d.ts.map