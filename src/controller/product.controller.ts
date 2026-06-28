// src/controllers/productController.ts
import { Request, Response } from "express";
import { ProductService } from "../service/product.service";

export class ProductController {
    static createProduct = async (req: Request, res: Response) => {
        try {
            const product = await ProductService.createProduct(req.body);
            res.status(201).json(product);
        } catch (error: any) {
            res.status(error.status || 500).json({
                error: error.message || "Internal Server Error",
            });
        }
    };

    static updateProduct = async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const product = await ProductService.updateProduct(
                id as string,
                req.body,
            );
            res.status(200).json(product);
        } catch (error: any) {
            res.status(error.status || 500).json({
                error: error.message || "Internal Server Error",
            });
        }
    };

    static deleteProduct = async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const result = await ProductService.deleteProduct(id as string);
            res.status(200).json(result);
        } catch (error: any) {
            res.status(error.status || 500).json({
                error: error.message || "Internal Server Error",
            });
        }
    };

    static getAllProducts = async (req: Request, res: Response) => {
        try {
            const products = await ProductService.getAllProducts();
            res.status(200).json(products);
        } catch (error: any) {
            res.status(error.status || 500).json({
                error: error.message || "Internal Server Error",
            });
        }
    };

    static getProductsBySupplier = async (req: Request, res: Response) => {
        try {
            const { supplierId } = req.params;
            const products = await ProductService.getProductsBySupplier(
                supplierId as string,
            );
            res.status(200).json(products);
        } catch (error: any) {
            res.status(error.status || 500).json({
                error: error.message || "Internal Server Error",
            });
        }
    };
}
