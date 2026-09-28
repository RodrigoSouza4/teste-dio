/**
 * Middleware de autenticação por API Key
 *
 * Ativado quando MCP_API_KEY estiver definida no ambiente.
 * Aceita a chave via:
 *   - Header:      X-Api-Key: <chave>
 *   - Query param: ?api_key=<chave>
 *
 * Para SSO/OAuth, substitua este middleware por um que valide
 * tokens JWT (ex: jsonwebtoken) ou faça introspection no IdP.
 *
 * Exemplo com Bearer JWT (extensão futura):
 *   const token = req.headers.authorization?.replace("Bearer ", "");
 *   const payload = jwt.verify(token, process.env.JWT_SECRET);
 */

import { Request, Response, NextFunction } from "express";

export function apiKeyMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const expectedKey = process.env.MCP_API_KEY;

  // Se MCP_API_KEY não estiver definida, autenticação desativada
  if (!expectedKey) {
    next();
    return;
  }

  const provided =
    (req.headers["x-api-key"] as string | undefined) ??
    (req.query["api_key"] as string | undefined);

  if (!provided) {
    res.status(401).json({
      error: "Unauthorized",
      message: "API Key obrigatória. Envie o header X-Api-Key ou o query param api_key.",
    });
    return;
  }

  if (provided !== expectedKey) {
    res.status(403).json({
      error: "Forbidden",
      message: "API Key inválida.",
    });
    return;
  }

  next();
}
