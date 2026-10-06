/** Central branding/config. The name is temporary until the final brand is approved. */
export const APP_CONFIG = {
  name: "Umrah Companion",
  shortName: "Umrah",
  version: "0.1.0",
  logo: "/icons/icon.svg",
  icon: "/icons/icon-192.png",
  themeColor: "#1f5135",
  /** Leave null until real pages/addresses exist; the UI hides links that are not configured. */
  supportUrl: null as string | null,
  contactEmail: null as string | null,
  privacyUrl: null as string | null,
  termsUrl: null as string | null,
  sourceDocument: "Umrah Guide.pdf",
} as const;
