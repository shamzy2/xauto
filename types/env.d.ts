declare namespace NodeJS {
  interface ProcessEnv {
    EXTERNAL_API_KEY?: string;
    CRM_WEBHOOK_SECRET?: string;
    INTAKE_VIEW_SECRET?: string;
    /** Canonical origin, e.g. https://www.xbilsenter.no — brukes til metadata, sitemap og robots */
    NEXT_PUBLIC_SITE_URL?: string;
    NEXT_PUBLIC_SUPABASE_URL?: string;
    NEXT_PUBLIC_SUPABASE_ANON_KEY?: string;
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?: string;
    SUPABASE_URL?: string;
    SUPABASE_SERVICE_ROLE_KEY?: string;
    SUPABASE_ANON_KEY?: string;
  }
}
