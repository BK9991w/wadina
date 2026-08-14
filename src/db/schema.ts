import {
  pgTable,
  serial,
  text,
  varchar,
  integer,
  boolean,
  numeric,
  jsonb,
  timestamp,
} from "drizzle-orm/pg-core";

export const cities = pgTable("cities", {
  id: serial("id").primaryKey(),
  slug: varchar("slug", { length: 64 }).notNull().unique(),
  nameAr: text("name_ar").notNull(),
  nameEn: text("name_en").notNull(),
  descriptionAr: text("description_ar").notNull(),
  imageUrl: text("image_url"),
});

export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  slug: varchar("slug", { length: 64 }).notNull().unique(),
  nameAr: text("name_ar").notNull(),
  nameEn: text("name_en").notNull(),
  icon: varchar("icon", { length: 8 }).notNull(),
  colorHex: varchar("color_hex", { length: 16 }).notNull(),
  descriptionAr: text("description_ar").notNull(),
});

export const attractions = pgTable("attractions", {
  id: serial("id").primaryKey(),
  slug: varchar("slug", { length: 96 }).notNull().unique(),
  nameAr: text("name_ar").notNull(),
  nameEn: text("name_en").notNull(),
  categoryId: integer("category_id")
    .notNull()
    .references(() => categories.id),
  cityId: integer("city_id")
    .notNull()
    .references(() => cities.id),
  shortDescriptionAr: text("short_description_ar").notNull(),
  descriptionAr: text("description_ar").notNull(),
  imageUrl: text("image_url").notNull(),
  priceLevel: varchar("price_level", { length: 16 }).notNull(), // free | low | medium | high
  durationHours: integer("duration_hours").notNull(),
  bestSeasonAr: text("best_season_ar").notNull(),
  rating: numeric("rating", { precision: 2, scale: 1 }).notNull().default("4.5"),
  isFeatured: boolean("is_featured").notNull().default(false),
  tags: jsonb("tags").$type<string[]>().notNull().default([]),
  highlights: jsonb("highlights").$type<string[]>().notNull().default([]),
  tipsAr: text("tips_ar").notNull().default(""),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const localProducts = pgTable("local_products", {
  id: serial("id").primaryKey(),
  slug: varchar("slug", { length: 96 }).notNull().unique(),
  nameAr: text("name_ar").notNull(),
  nameEn: text("name_en").notNull(),
  category: varchar("category", { length: 32 }).notNull(), // food | craft | textile | beauty
  descriptionAr: text("description_ar").notNull(),
  imageUrl: text("image_url").notNull(),
  priceRangeAr: text("price_range_ar").notNull(),
  whereToBuyAr: text("where_to_buy_ar").notNull(),
  isFeatured: boolean("is_featured").notNull().default(false),
});

export const itineraryRequests = pgTable("itinerary_requests", {
  id: serial("id").primaryKey(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  days: integer("days").notNull(),
  interests: jsonb("interests").$type<string[]>().notNull().default([]),
  pace: varchar("pace", { length: 16 }).notNull(),
  budget: varchar("budget", { length: 16 }).notNull(),
  companions: varchar("companions", { length: 16 }).notNull(),
  resultSummary: text("result_summary").notNull().default(""),
});

export const conversations = pgTable("conversations", {
  id: serial("id").primaryKey(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  lastMessageAr: text("last_message_ar").notNull().default(""),
});

export const trips = pgTable("trips", {
  id: serial("id").primaryKey(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  days: jsonb("days").$type<Array<Record<string, unknown>>>().notNull().default([]),
  summary: text("summary").notNull().default(""),
  seasonAdvice: text("season_advice").notNull().default(""),
  budgetAdvice: text("budget_advice").notNull().default(""),
  suggestedProductSlugs: jsonb("suggested_product_slugs").$type<string[]>().notNull().default([]),
});
