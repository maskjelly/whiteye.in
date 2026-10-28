/** Public collector address; private ingestion keys are only read by middleware. */
export const arrivalUrl = process.env.NEXT_PUBLIC_ARRIVAL_URL?.replace(/\/$/, "")
export const arrivalSiteId = "site_local"
