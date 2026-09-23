// Type declarations for Deno runtime in Supabase Edge Functions
declare namespace Deno {
  export interface Env {
    get(key: string): string | undefined;
    set(key: string, value: string): void;
    delete(key: string): void;
    toObject(): Record<string, string>;
  }

  export const env: Env;
}

declare module "https://deno.land/std@0.168.0/http/server.ts" {
  export function serve(
    handler: (req: Request) => Response | Promise<Response>,
    options?: { port?: number; onListen?: (params: { port: number; hostname: string }) => void }
  ): void;
}

declare module "https://esm.sh/@supabase/supabase-js@2.39.8" {
  export * from "@supabase/supabase-js";
}
