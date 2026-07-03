// Minimal ambient declaration so the MCP tool files (executed at runtime by
// Deno inside the generated Supabase Edge Function) typecheck under the app's
// Vite/browser tsconfig without pulling in @types/node.
declare const process: {
  env: Record<string, string | undefined>;
};
