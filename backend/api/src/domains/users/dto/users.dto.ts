import { z } from "zod";
import { UpdateSettingsSchema } from "@moots/contracts";

export type UpdateSettingsInput = z.infer<typeof UpdateSettingsSchema>["body"];
