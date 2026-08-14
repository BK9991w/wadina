import { db } from "@/db";
import { attractions, categories, cities, localProducts } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function getCategories() {
  return db.select().from(categories);
}

export async function getCities() {
  return db.select().from(cities);
}

export async function getAttractions() {
  return db
    .select({
      id: attractions.id,
      slug: attractions.slug,
      nameAr: attractions.nameAr,
      nameEn: attractions.nameEn,
      shortDescriptionAr: attractions.shortDescriptionAr,
      imageUrl: attractions.imageUrl,
      priceLevel: attractions.priceLevel,
      durationHours: attractions.durationHours,
      bestSeasonAr: attractions.bestSeasonAr,
      rating: attractions.rating,
      isFeatured: attractions.isFeatured,
      tags: attractions.tags,
      categoryId: attractions.categoryId,
      cityId: attractions.cityId,
      categorySlug: categories.slug,
      categoryNameAr: categories.nameAr,
      categoryIcon: categories.icon,
      categoryColor: categories.colorHex,
      citySlug: cities.slug,
      cityNameAr: cities.nameAr,
    })
    .from(attractions)
    .innerJoin(categories, eq(attractions.categoryId, categories.id))
    .innerJoin(cities, eq(attractions.cityId, cities.id));
}

export async function getAttractionsByIds(ids: number[]) {
  if (ids.length === 0) return [];
  const all = await getAttractions();
  return all.filter((a) => ids.includes(a.id));
}

export async function getAttractionBySlug(slug: string) {
  const rows = await db
    .select({
      id: attractions.id,
      slug: attractions.slug,
      nameAr: attractions.nameAr,
      nameEn: attractions.nameEn,
      descriptionAr: attractions.descriptionAr,
      shortDescriptionAr: attractions.shortDescriptionAr,
      imageUrl: attractions.imageUrl,
      priceLevel: attractions.priceLevel,
      durationHours: attractions.durationHours,
      bestSeasonAr: attractions.bestSeasonAr,
      rating: attractions.rating,
      isFeatured: attractions.isFeatured,
      tags: attractions.tags,
      highlights: attractions.highlights,
      tipsAr: attractions.tipsAr,
      categoryId: attractions.categoryId,
      cityId: attractions.cityId,
      categorySlug: categories.slug,
      categoryNameAr: categories.nameAr,
      categoryIcon: categories.icon,
      categoryColor: categories.colorHex,
      citySlug: cities.slug,
      cityNameAr: cities.nameAr,
      cityDescriptionAr: cities.descriptionAr,
    })
    .from(attractions)
    .innerJoin(categories, eq(attractions.categoryId, categories.id))
    .innerJoin(cities, eq(attractions.cityId, cities.id))
    .where(eq(attractions.slug, slug));
  return rows[0] ?? null;
}

export async function getLocalProducts() {
  return db.select().from(localProducts);
}

export async function getAttractionsByCategorySlugs(slugs: string[]) {
  if (slugs.length === 0) return [];
  const all = await getAttractions();
  return all.filter((a) => slugs.includes(a.categorySlug));
}

export type AttractionListItem = Awaited<ReturnType<typeof getAttractions>>[number];
