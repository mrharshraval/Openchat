import { z } from "zod";
import { RegisterSchema, VerifyOtpSchema, LoginSchema } from "@moots/contracts";

export type RegisterInput = z.infer<typeof RegisterSchema>["body"];
export type VerifyOtpInput = z.infer<typeof VerifyOtpSchema>["body"];
export type LoginInput = z.infer<typeof LoginSchema>["body"];
