import { Router } from "express";
import multer from "multer";
import type { SellerProductController } from "../../domain/controller/seller-product.js";
import { SellerProductResponseAdapter } from "./adapters/seller-product-response.adapter.js";
import { SellerProductRequestAdapter } from "./adapters/seller-product-request.adapter.js";
import { SellerProductRequestListDtoSchema } from "./wire/in/seller-product-request.dto.js";

export class SellerProductEndpoint {
  readonly router: Router;

  constructor(private readonly controller: SellerProductController) {
    this.router = Router();
    const upload = multer({ storage: multer.memoryStorage() });

    this.router.post(
      "/catalog/import",
      upload.single("file"),
      (req, res) => {
        if (!req.file) {
          return res
            .status(400)
            .json({ error: 'No file uploaded. Use multipart field "file".' });
        }

        let parsed: unknown;
        try {
          parsed = JSON.parse(req.file.buffer.toString("utf-8"));
        } catch {
          return res.status(400).json({ error: "Invalid JSON" });
        }

        const validation = SellerProductRequestListDtoSchema.safeParse(parsed);
        if (!validation.success) {
          return res.status(400).json({
            error: "Invalid file format",
            details: validation.error.issues,
          });
        }

        const requests = validation.data.map((dto) =>
          SellerProductRequestAdapter.toDomain(dto),
        );
        const result = this.controller.consolidate(requests);
        return res
          .status(200)
          .json(SellerProductResponseAdapter.toDto(result));
      },
    );
  }
}
