// src/controllers/supplierController.ts
import { Request, Response } from "express";
import { SupplierService } from "../service/supplier.service";

export class SupplierController {
    static addSupplier = async (req: Request, res: Response) => {
        try {
            const supplier = await SupplierService.addSupplier(req.body);
            res.status(201).json(supplier);
        } catch (error: any) {
            res.status(error.status || 500).json({
                error: error.message || "Internal Server Error",
            });
        }
    };

    static updateSupplier = async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const supplier = await SupplierService.updateSupplier(
                id as string,
                req.body,
            );
            res.status(200).json(supplier);
        } catch (error: any) {
            res.status(error.status || 500).json({
                error: error.message || "Internal Server Error",
            });
        }
    };

    static getAllSuppliers = async (req: Request, res: Response) => {
        try {
            const suppliers = await SupplierService.getAllSuppliers();
            res.status(200).json(suppliers);
        } catch (error: any) {
            res.status(error.status || 500).json({
                error: error.message || "Internal Server Error",
            });
        }
    };
}
