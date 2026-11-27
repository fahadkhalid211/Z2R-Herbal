import { revalidateTag } from "next/cache";
import { CATALOG_TAG } from "@/services/cache";

export function revalidateCatalog(): void {
  revalidateTag(CATALOG_TAG, { expire: 0 });
}
