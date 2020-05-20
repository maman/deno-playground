export const SHARE_SALT = Deno.env.get("SHARE_SALT") || "CAFEBABE";
export const JSONBIN_USER = Deno.env.get("JSONBIN_USER") || "";
export const JSONBIN_TOKEN = Deno.env.get("JSONBIN_TOKEN") || "";
export const JSONBIN_URL = `https://jsonbin.org/${JSONBIN_USER}`;
