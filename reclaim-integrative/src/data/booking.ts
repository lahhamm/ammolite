// Booking catalog for the in-site booking flow (demo phase, no live integration).
// Every bookable service at both clinic locations, typed and queryable.

export type LocationId = "newport-beach" | "rancho-cucamonga";

export type CategoryId =
  | "blood-draw"
  | "consultations"
  | "im-shots"
  | "iv-therapy"
  | "eboo";

export type ServiceKind = "Lab" | "Office Visit" | "Procedure" | "Other";

export interface Location {
  id: LocationId;
  name: string;
  address: string;
  phone?: string;
}

export interface Category {
  id: CategoryId;
  name: string;
  description: string;
  locations: LocationId[];
}

export interface AddOn {
  id: string;
  name: string;
  price: number;
  description?: string;
}

export interface ServiceVariant {
  label: string;
  price: number;
}

export interface BookingService {
  slug: string;
  name: string;
  category: CategoryId;
  durationMin: number;
  /** null = program/membership pricing. Render "Membership pricing", never "$0". */
  price: number | null;
  priceNote?: string;
  kind: ServiceKind;
  description?: string;
  /** Quiet informational requirement shown on service and review screens. */
  requirementNote?: string;
  locations: LocationId[];
  /** Suggested add-ons (IV services). */
  addOnIds?: string[];
  /** Dosage tiers (IV Vitamin C). */
  variants?: ServiceVariant[];
}

export const LOCATIONS: Location[] = [
  {
    id: "newport-beach",
    name: "Newport Beach",
    address: "1100 Quail Street, Suite 117, Newport Beach, CA",
    phone: "(949) 423-3522",
  },
  {
    id: "rancho-cucamonga",
    name: "Rancho Cucamonga",
    address: "10470 Foothill Boulevard, Suite 220, Rancho Cucamonga, CA",
  },
];

export const CATEGORIES: Category[] = [
  {
    id: "blood-draw",
    name: "Blood Draw",
    description: "Lab work to guide your personalized plan.",
    locations: ["newport-beach", "rancho-cucamonga"],
  },
  {
    id: "consultations",
    name: "Consultations",
    description: "New patient visits, follow ups, and lab reviews.",
    locations: ["newport-beach", "rancho-cucamonga"],
  },
  {
    id: "im-shots",
    name: "Vitamin Injections (IM Shots)",
    description: "Quick intramuscular shots for energy and recovery.",
    locations: ["newport-beach", "rancho-cucamonga"],
  },
  {
    id: "iv-therapy",
    name: "IV Therapy",
    description: "Customized nutrient infusions with optional add-ons.",
    locations: ["newport-beach", "rancho-cucamonga"],
  },
  {
    id: "eboo",
    name: "EBOO Therapy",
    description: "Advanced blood oxygenation and ozonation.",
    locations: ["newport-beach"],
  },
];

export const ADD_ONS: AddOn[] = [
  {
    id: "glut-push",
    name: "Glutathione Push",
    price: 50,
    description: "Master antioxidant, supports detox, immunity, recovery.",
  },
  {
    id: "iv-glut-1g",
    name: "IV Glutathione, 1 Gram",
    price: 120,
    description: "Master antioxidant, supports detox, immunity, recovery.",
  },
  {
    id: "iv-glut-2g",
    name: "IV Glutathione, 2 Grams",
    price: 160,
    description: "Master antioxidant, supports detox, immunity, recovery.",
  },
  { id: "iv-hangover-addon", name: "IV Hangover", price: 175 },
  { id: "iv-methylene-blue", name: "IV Methylene Blue", price: 200 },
  { id: "iv-nad-250-addon", name: "IV NAD 250mg", price: 300 },
  { id: "iv-nad-750-addon", name: "IV NAD 750mg", price: 900 },
  { id: "iv-nutrition-addon", name: "IV Nutrition", price: 150 },
  { id: "iv-plaquex-addon", name: "IV Plaquex", price: 220 },
  { id: "iv-myers-addon", name: "IV Myers Cocktail", price: 160 },
  { id: "iv-iron-addon", name: "IV Iron", price: 300 },
  { id: "iv-migraine-addon", name: "IV Migraine and Headache", price: 180 },
  {
    id: "b12-addon",
    name: "B12 Vitamin Shot",
    price: 25,
    description: "Improve energy, immune support, mental clarity.",
  },
  {
    id: "taurine-addon",
    name: "Taurine Vitamin Shot",
    price: 20,
    description: "Improve energy, mental clarity, heart health.",
  },
];

const BOTH: LocationId[] = ["newport-beach", "rancho-cucamonga"];
const RC_ONLY: LocationId[] = ["rancho-cucamonga"];
const NB_ONLY: LocationId[] = ["newport-beach"];

export const SERVICES: BookingService[] = [
  // Blood Draw
  {
    slug: "blood-draw",
    name: "Blood Draw",
    category: "blood-draw",
    durationMin: 30,
    price: 40,
    kind: "Lab",
    description: "Typically fasting unless otherwise noted.",
    locations: BOTH,
  },

  // Consultations
  {
    slug: "follow-up-virtual-lab-review",
    name: "Follow Up (Virtual), Lab Review",
    category: "consultations",
    durationMin: 45,
    price: 175,
    kind: "Office Visit",
    description:
      "First follow-up: check in on treatment recommendations, review lab results in depth, refine the plan.",
    locations: BOTH,
  },
  {
    slug: "dr-colon-initial-consultation-virtual",
    name: "Dr. Colon Initial Consultation (Virtual)",
    category: "consultations",
    durationMin: 60,
    price: 400,
    kind: "Office Visit",
    description:
      "Detailed health history: goals, medical and family history, current symptoms, medications and supplements, diet and lifestyle. Diagnostic testing may be recommended (out of pocket, HSA/FSA accepted).",
    locations: BOTH,
  },
  {
    slug: "new-patient-visit-virtual",
    name: "New Patient Visit (Virtual)",
    category: "consultations",
    durationMin: 60,
    price: 350,
    kind: "Office Visit",
    locations: RC_ONLY,
  },
  {
    slug: "follow-up-in-office-30",
    name: "Follow Up (In Office), 30 Minutes",
    category: "consultations",
    durationMin: 30,
    price: 150,
    kind: "Office Visit",
    locations: BOTH,
  },
  {
    slug: "follow-up-in-person-lab-review",
    name: "Follow Up (In Person), Lab Review",
    category: "consultations",
    durationMin: 45,
    price: 175,
    kind: "Office Visit",
    locations: BOTH,
  },
  {
    slug: "follow-up-virtual-30",
    name: "Follow Up (Virtual), 30 Minutes",
    category: "consultations",
    durationMin: 30,
    price: 150,
    kind: "Office Visit",
    locations: BOTH,
  },
  {
    slug: "dr-colon-initial-consultation-in-office",
    name: "Dr. Colon Initial Consultation (In Office)",
    category: "consultations",
    durationMin: 60,
    price: 400,
    kind: "Office Visit",
    locations: BOTH,
  },

  // IM Shots
  {
    slug: "b12-vitamin-shot",
    name: "B12 Vitamin Shot",
    category: "im-shots",
    durationMin: 15,
    price: 25,
    kind: "Procedure",
    description: "Improve energy, immune support, mental clarity.",
    locations: RC_ONLY,
  },
  {
    slug: "mega-b-vitamin-shot",
    name: "Mega B Vitamin Shot",
    category: "im-shots",
    durationMin: 15,
    price: 35,
    kind: "Procedure",
    description: "Combination of B12 and B Complex to support energy levels.",
    locations: RC_ONLY,
  },
  {
    slug: "fat-burner-vitamin-shot",
    name: "Fat Burner Vitamin Shot",
    category: "im-shots",
    durationMin: 15,
    price: 30,
    kind: "Procedure",
    description:
      "Increase natural energy levels, target belly fat, improve liver health and function.",
    locations: BOTH,
  },
  {
    slug: "fat-burner-with-b12-vitamin-shot",
    name: "Fat Burner with B12 Vitamin Shot",
    category: "im-shots",
    durationMin: 15,
    price: 40,
    kind: "Procedure",
    locations: RC_ONLY,
  },
  {
    slug: "taurine-vitamin-shot",
    name: "Taurine Vitamin Shot",
    category: "im-shots",
    durationMin: 15,
    price: 20,
    kind: "Procedure",
    description:
      "Improve energy, mental clarity, heart health and athletic performance.",
    locations: RC_ONLY,
  },
  {
    slug: "trt-injection",
    name: "TRT Injection",
    category: "im-shots",
    durationMin: 15,
    price: null,
    kind: "Procedure",
    locations: BOTH,
  },
  {
    slug: "semaglutide",
    name: "Semaglutide",
    category: "im-shots",
    durationMin: 15,
    price: null,
    kind: "Other",
    locations: BOTH,
  },

  // EBOO
  {
    slug: "eboo",
    name: "EBOO",
    category: "eboo",
    durationMin: 120,
    price: 1200,
    kind: "Procedure",
    description:
      "Extracorporeal blood oxygenation and ozonation to detoxify, oxygenate, and revitalize your blood.",
    locations: NB_ONLY,
  },

  // IV Therapy
  {
    slug: "iv-myers-cocktail",
    name: "IV Myers Cocktail",
    category: "iv-therapy",
    durationMin: 60,
    price: 160,
    kind: "Procedure",
    locations: BOTH,
    addOnIds: [
      "glut-push",
      "iv-glut-2g",
      "iv-glut-1g",
      "iv-hangover-addon",
      "iv-methylene-blue",
      "iv-nad-250-addon",
      "iv-nad-750-addon",
      "iv-nutrition-addon",
      "iv-plaquex-addon",
    ],
  },
  {
    slug: "iv-hangover",
    name: "IV Hangover",
    category: "iv-therapy",
    durationMin: 60,
    price: 175,
    kind: "Procedure",
    locations: BOTH,
    addOnIds: ["b12-addon", "glut-push", "iv-glut-1g", "taurine-addon"],
  },
  {
    slug: "glutathione-push",
    name: "Glutathione Push",
    category: "iv-therapy",
    durationMin: 15,
    price: 50,
    kind: "Procedure",
    description: "Master antioxidant, supports detox, immunity, recovery.",
    locations: BOTH,
    addOnIds: ["iv-hangover-addon", "iv-iron-addon", "iv-myers-addon"],
  },
  {
    slug: "iv-immune-support",
    name: "IV Immune Support",
    category: "iv-therapy",
    durationMin: 60,
    price: 220,
    kind: "Procedure",
    requirementNote: "Requires G6PD enzyme marker blood draw.",
    locations: BOTH,
    addOnIds: ["glut-push"],
  },
  {
    slug: "iv-vitamin-c",
    name: "IV Vitamin C",
    category: "iv-therapy",
    durationMin: 60,
    price: 180,
    priceNote: "Priced by dosage tier.",
    kind: "Procedure",
    requirementNote: "Requires G6PD enzyme marker.",
    locations: BOTH,
    variants: [
      { label: "25g", price: 180 },
      { label: "40g", price: 210 },
      { label: "50g", price: 240 },
      { label: "60g", price: 265 },
      { label: "75g", price: 295 },
    ],
  },
  {
    slug: "iv-iron",
    name: "IV Iron",
    category: "iv-therapy",
    durationMin: 60,
    price: 300,
    kind: "Procedure",
    requirementNote: "Requires documentation of low iron.",
    locations: BOTH,
    addOnIds: ["glut-push", "iv-myers-addon"],
  },
  {
    slug: "iv-glutathione-1g",
    name: "IV Glutathione, 1 Gram",
    category: "iv-therapy",
    durationMin: 30,
    price: 120,
    kind: "Procedure",
    description: "Master antioxidant, supports detox, immunity, recovery.",
    locations: BOTH,
    addOnIds: ["b12-addon", "iv-migraine-addon", "iv-myers-addon"],
  },
  {
    slug: "iv-glutathione-2g",
    name: "IV Glutathione, 2 Grams",
    category: "iv-therapy",
    durationMin: 30,
    price: 160,
    kind: "Procedure",
    description: "Master antioxidant, supports detox, immunity, recovery.",
    locations: BOTH,
    addOnIds: [
      "iv-hangover-addon",
      "iv-methylene-blue",
      "iv-myers-addon",
      "iv-nad-250-addon",
      "iv-nad-750-addon",
      "iv-nutrition-addon",
      "iv-plaquex-addon",
    ],
  },
  {
    slug: "iv-mitochondria",
    name: "IV Mitochondria",
    category: "iv-therapy",
    durationMin: 60,
    price: 160,
    kind: "Procedure",
    locations: BOTH,
  },
  {
    slug: "iv-nutrition",
    name: "IV Nutrition",
    category: "iv-therapy",
    durationMin: 60,
    price: 150,
    kind: "Procedure",
    locations: BOTH,
  },
  {
    slug: "iv-migraine-and-headache",
    name: "IV Migraine and Headache",
    category: "iv-therapy",
    durationMin: 60,
    price: 180,
    kind: "Procedure",
    locations: BOTH,
  },
  {
    slug: "iv-nad-250",
    name: "IV NAD 250mg",
    category: "iv-therapy",
    durationMin: 60,
    price: 300,
    kind: "Procedure",
    locations: BOTH,
  },
  {
    slug: "iv-plaquex",
    name: "IV Plaquex",
    category: "iv-therapy",
    durationMin: 60,
    price: 220,
    kind: "Procedure",
    locations: BOTH,
  },
  {
    slug: "iv-nad-750",
    name: "IV NAD 750mg",
    category: "iv-therapy",
    durationMin: 120,
    price: 900,
    kind: "Procedure",
    locations: BOTH,
  },
  {
    slug: "iv-mens-health",
    name: "IV Men's Health",
    category: "iv-therapy",
    durationMin: 60,
    price: 180,
    kind: "Procedure",
    locations: BOTH,
  },
];

// Helpers

export function getServiceBySlug(slug: string): BookingService | undefined {
  return SERVICES.find((s) => s.slug === slug);
}

export function getCategoryById(id: string): Category | undefined {
  return CATEGORIES.find((c) => c.id === id);
}

export function getLocationById(id: string): Location | undefined {
  return LOCATIONS.find((l) => l.id === id);
}

export function getServicesByCategory(
  category: CategoryId,
  location?: LocationId,
): BookingService[] {
  return SERVICES.filter(
    (s) =>
      s.category === category &&
      (location === undefined || s.locations.includes(location)),
  );
}

export function getLocationsForService(slug: string): Location[] {
  const service = getServiceBySlug(slug);
  if (!service) return [];
  return LOCATIONS.filter((l) => service.locations.includes(l.id));
}

export function getAddOnsForService(slug: string): AddOn[] {
  const service = getServiceBySlug(slug);
  if (!service?.addOnIds) return [];
  return service.addOnIds
    .map((id) => ADD_ONS.find((a) => a.id === id))
    .filter((a): a is AddOn => a !== undefined);
}

/** Formats a price in whole dollars; null means program/membership pricing. */
export function formatPrice(price: number | null): string {
  if (price === null) return "Membership pricing";
  return `$${price.toLocaleString("en-US")}`;
}
