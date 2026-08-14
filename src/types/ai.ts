// AI Tourism Agent — shared types used by server and client.
export type Intent =
  | "greeting"
  | "general_question"
  | "ask_attraction"
  | "recommendation"
  | "trip_planning"
  | "modify_trip"
  | "questionnaire"
  | "farewell";

export type ToolName =
  | "get_attractions"
  | "search_attractions"
  | "get_attraction_details"
  | "create_trip"
  | "add_place_to_trip"
  | "remove_place_from_trip"
  | "replace_place_in_trip"
  | "swap_places_in_trip"
  | "reorder_trip_days"
  | "change_trip_days"
  | "list_available_places"
  | "select_hotel";

export interface ToolCall {
  name: ToolName;
  arguments: Record<string, unknown>;
  id: string;
}

export interface ToolResult {
  toolCallId: string;
  name: ToolName;
  ok: boolean;
  message: string;
  data?: unknown;
}

export interface AIResponse {
  type: "response" | "tool_call" | "error" | "fallback";
  text: string;
  trip?: Trip;
  suggestedReplies?: string[];
  intent?: Intent;
  error?: string;
}

export interface HotelOption {
  id: string;
  nameAr: string;
  nameEn: string;
  stars: number | null;
  oasisNameAr: string;
  budget: string;
  icon: string;
  phone?: string;
}

export interface Trip {
  id?: string;
  days: TripDay[];
  summary: string;
  seasonAdvice: string;
  budgetAdvice: string;
  suggestedProductSlugs: string[];
  hotelOptions?: HotelOption[];
  selectedHotel?: HotelOption | null;
  departureCity?: string;
}

export interface TripDay {
  day: number;
  cityNameAr: string;
  citySlug?: string;
  title: string;
  items: TripItem[];
  tip: string;
}

export interface TripItem {
  timeOfDay: string;
  id: number;
  nameAr: string;
  nameEn: string;
  slug: string;
  imageUrl: string;
  priceLevel: string;
  durationHours: number;
  rating: string;
  cityNameAr: string;
  categoryNameAr: string;
  categoryIcon: string;
}

export interface ConversationMessage {
  role: "user" | "assistant";
  content: string;
  trip?: Trip;
  suggestedReplies?: string[];
}

export interface AIChatRequest {
  conversation: ConversationMessage[];
  trip?: Trip;
  message: string;
}

export interface AIChatResponse {
  response: AIResponse;
  conversation: ConversationMessage[];
  trip?: Trip;
}

export const CATEGORIES = {
  heritage: { slug: "heritage", nameAr: "التراث والآثار", icon: "🏛️" },
  safari: { slug: "safari", nameAr: "السفاري والمغامرات", icon: "🚙" },
  therapeutic: { slug: "therapeutic", nameAr: "السياحة العلاجية", icon: "♨️" },
  nature: { slug: "nature", nameAr: "الطبيعة والمحميات", icon: "🌿" },
} as const;

export const PACE_OPTIONS: Array<{ value: Trip["days"] extends number ? never : "relaxed" | "balanced" | "adventurous"; labelAr: string }> = [
  { value: "relaxed", labelAr: "هادئ" },
  { value: "balanced", labelAr: "متوازن" },
  { value: "adventurous", labelAr: "مغامر" },
] as const;

export const BUDGET_OPTIONS: Array<{ value: "economic" | "medium" | "premium"; labelAr: string }> = [
  { value: "economic", labelAr: "اقتصادية" },
  { value: "medium", labelAr: "متوسطة" },
  { value: "premium", labelAr: "مميزة" },
] as const;

export const COMPANION_OPTIONS: Array<{ value: "solo" | "couple" | "family" | "friends"; labelAr: string }> = [
  { value: "solo", labelAr: "بمفردي" },
  { value: "couple", labelAr: "مع شريك حياتي" },
  { value: "family", labelAr: "مع العائلة" },
  { value: "friends", labelAr: "مع الأصدقاء" },
] as const;
