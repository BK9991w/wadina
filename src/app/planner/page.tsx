import { getCategories } from "@/lib/queries";
import { PlannerPageClient } from "./PlannerPageClient";

export const dynamic = "force-dynamic";

export default async function PlannerPage() {
  const categories = await getCategories();
  return <PlannerPageClient categories={categories} />;
}
