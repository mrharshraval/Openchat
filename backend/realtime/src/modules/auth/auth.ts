import jwt from "jsonwebtoken";
import { env } from "../../env.js";
import { TokenClaims, TokenClaimsSchema } from "@moots/contracts";

export function verifyToken(token: string): TokenClaims {
  const secret = env.JWT_SECRET;
  const decoded = jwt.verify(token, secret);
  return TokenClaimsSchema.parse(decoded);
}
