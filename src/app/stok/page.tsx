"use client";

import { isProductionDatabaseConfigured } from "@/lib/repository";
import { ProductionStockPage } from "./ProductionStockPage";
import { PreparationStockPage } from "./PreparationStockPage";

export default function StokPage() {
  return isProductionDatabaseConfigured() ? <ProductionStockPage /> : <PreparationStockPage />;
}
