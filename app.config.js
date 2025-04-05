import "dotenv/config";

export default {
  expo: {
    name: "scar-fit",
    slug: "scar-fit",
    version: "1.0.0",
    sdkVersion: "51.0.0",
    extra: {
      supabaseUrl: process.env.SUPABASE_URL,
      supabaseAnonKey: process.env.SUPABASE_ANON_KEY,
      appVersion: "1.0.0",
    },
  },
};
