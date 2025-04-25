import { createLoader, parseAsInteger } from "nuqs/server";
import { getFiltersStateParser, getSortingStateParser } from "@/lib/parser";

export const loadSearchParams = createLoader({
  page: parseAsInteger.withDefault(1),
  perPage: parseAsInteger.withDefault(10),

  sort: getSortingStateParser(),

  filters: getFiltersStateParser().withDefault([]),
});
