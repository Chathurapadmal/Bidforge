
export const API_BASE =

  (typeof window === "undefined"

    ? process.env.API_BASE_URL_INTERNAL

    : process.env.NEXT_PUBLIC_API_BASE_URL) ||

  process.env.NEXT_PUBLIC_API_BASE_URL ||

  "http://localhost:5062";


