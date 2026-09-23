import { z } from "zod";

export const BackupMetadataSchema = z.object({
  app: z.string().default("Kopdes Merah Putih Ladang Laweh"),
  version: z.literal(1),
  exported_at: z.string(),
  checksum_count: z.number().int().nonnegative().optional(),
});

export const BackupPayloadSchema = z.object({
  organization_profile: z.array(z.record(z.unknown())).default([]),
  business_units: z.array(z.record(z.unknown())).default([]),
  tasks: z.array(z.record(z.unknown())).default([]),
  products: z.array(z.record(z.unknown())).default([]),
  unit_daily_reports: z.array(z.record(z.unknown())).default([]),
  members: z.array(z.record(z.unknown())).default([]),
});

export const BackupFileSchema = z.object({
  app: z.string(),
  version: z.literal(1),
  exported_at: z.string(),
  data: BackupPayloadSchema,
});

export type BackupFile = z.infer<typeof BackupFileSchema>;
