import { z } from "zod";

export const SellerProductRequestDtoSchema = z.object({
  Id: z.string().min(1),
  SellerName: z.string().min(1),
  Name: z.string().min(1),
  Brand: z.string().nullable(),
  Category: z.string().nullable(),
});

export const SellerProductRequestListDtoSchema = z.array(
  SellerProductRequestDtoSchema,
);

export type SellerProductRequestDto = z.infer<
  typeof SellerProductRequestDtoSchema
>;
