import { describe, expect, it } from "vitest";
import {
  ADD_ONS,
  CATEGORIES,
  LOCATIONS,
  SERVICES,
  formatPrice,
  getAddOnsForService,
  getLocationsForService,
  getServiceBySlug,
  getServicesByCategory,
} from "./booking";

describe("booking data integrity", () => {
  it("has unique service slugs", () => {
    const slugs = SERVICES.map((s) => s.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("has unique add-on ids", () => {
    const ids = ADD_ONS.map((a) => a.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("resolves every addOnId on every service to a real add-on", () => {
    const addOnIds = new Set(ADD_ONS.map((a) => a.id));
    for (const service of SERVICES) {
      for (const id of service.addOnIds ?? []) {
        expect(addOnIds.has(id), `${service.slug} references unknown add-on ${id}`).toBe(true);
      }
    }
  });

  it("gives every service at least one valid location", () => {
    const locationIds = new Set(LOCATIONS.map((l) => l.id));
    for (const service of SERVICES) {
      expect(service.locations.length, `${service.slug} has no locations`).toBeGreaterThan(0);
      for (const loc of service.locations) {
        expect(locationIds.has(loc), `${service.slug} has unknown location ${loc}`).toBe(true);
      }
    }
  });

  it("assigns every service a valid category", () => {
    const categoryIds = new Set(CATEGORIES.map((c) => c.id));
    for (const service of SERVICES) {
      expect(categoryIds.has(service.category), `${service.slug} has unknown category`).toBe(true);
    }
  });

  it("offers EBOO at Newport Beach only", () => {
    const eboo = getServiceBySlug("eboo");
    expect(eboo?.locations).toEqual(["newport-beach"]);
  });

  it("offers Mega B, B12, Taurine, and Fat Burner with B12 at Rancho Cucamonga only", () => {
    for (const slug of [
      "mega-b-vitamin-shot",
      "b12-vitamin-shot",
      "taurine-vitamin-shot",
      "fat-burner-with-b12-vitamin-shot",
    ]) {
      expect(getServiceBySlug(slug)?.locations, slug).toEqual(["rancho-cucamonga"]);
    }
  });

  it("offers New Patient Visit (Virtual) at Rancho Cucamonga only", () => {
    expect(getServiceBySlug("new-patient-visit-virtual")?.locations).toEqual([
      "rancho-cucamonga",
    ]);
  });

  it("matches spec prices for key services", () => {
    const expected: Record<string, number | null> = {
      "blood-draw": 40,
      "follow-up-virtual-lab-review": 175,
      "dr-colon-initial-consultation-virtual": 400,
      "new-patient-visit-virtual": 350,
      "follow-up-in-office-30": 150,
      "follow-up-in-person-lab-review": 175,
      "follow-up-virtual-30": 150,
      "dr-colon-initial-consultation-in-office": 400,
      "b12-vitamin-shot": 25,
      "mega-b-vitamin-shot": 35,
      "fat-burner-vitamin-shot": 30,
      "fat-burner-with-b12-vitamin-shot": 40,
      "taurine-vitamin-shot": 20,
      "trt-injection": null,
      semaglutide: null,
      eboo: 1200,
      "iv-myers-cocktail": 160,
      "iv-hangover": 175,
      "glutathione-push": 50,
      "iv-immune-support": 220,
      "iv-vitamin-c": 180,
      "iv-iron": 300,
      "iv-glutathione-1g": 120,
      "iv-glutathione-2g": 160,
      "iv-mitochondria": 160,
      "iv-nutrition": 150,
      "iv-migraine-and-headache": 180,
      "iv-nad-250": 300,
      "iv-plaquex": 220,
      "iv-nad-750": 900,
      "iv-mens-health": 180,
    };
    for (const [slug, price] of Object.entries(expected)) {
      expect(getServiceBySlug(slug)?.price, slug).toBe(price);
    }
    // Every catalogued service is covered by this price check.
    expect(Object.keys(expected).sort()).toEqual(SERVICES.map((s) => s.slug).sort());
  });

  it("matches spec prices for the add-on catalog", () => {
    const expected: Record<string, number> = {
      "glut-push": 50,
      "iv-glut-1g": 120,
      "iv-glut-2g": 160,
      "iv-hangover-addon": 175,
      "iv-methylene-blue": 200,
      "iv-nad-250-addon": 300,
      "iv-nad-750-addon": 900,
      "iv-nutrition-addon": 150,
      "iv-plaquex-addon": 220,
      "iv-myers-addon": 160,
      "iv-iron-addon": 300,
      "iv-migraine-addon": 180,
      "b12-addon": 25,
      "taurine-addon": 20,
    };
    expect(Object.keys(expected).sort()).toEqual(ADD_ONS.map((a) => a.id).sort());
    for (const addOn of ADD_ONS) {
      expect(addOn.price, addOn.id).toBe(expected[addOn.id]);
    }
  });

  it("defines the five Vitamin C dosage tiers", () => {
    const vitC = getServiceBySlug("iv-vitamin-c");
    expect(vitC?.variants).toEqual([
      { label: "25g", price: 180 },
      { label: "40g", price: 210 },
      { label: "50g", price: 240 },
      { label: "60g", price: 265 },
      { label: "75g", price: 295 },
    ]);
  });

  it("keeps all visible copy free of em-dashes", () => {
    const texts: string[] = [];
    for (const s of SERVICES) {
      texts.push(s.name, s.description ?? "", s.requirementNote ?? "", s.priceNote ?? "");
    }
    for (const a of ADD_ONS) texts.push(a.name, a.description ?? "");
    for (const c of CATEGORIES) texts.push(c.name, c.description);
    for (const l of LOCATIONS) texts.push(l.name, l.address);
    for (const text of texts) {
      expect(text.includes("—"), `em-dash found in: ${text}`).toBe(false);
    }
  });
});

describe("booking helpers", () => {
  it("getServicesByCategory filters by location", () => {
    const nbShots = getServicesByCategory("im-shots", "newport-beach");
    expect(nbShots.map((s) => s.slug).sort()).toEqual([
      "fat-burner-vitamin-shot",
      "semaglutide",
      "trt-injection",
    ]);
    const rcShots = getServicesByCategory("im-shots", "rancho-cucamonga");
    expect(rcShots).toHaveLength(7);
  });

  it("getLocationsForService resolves full location records", () => {
    expect(getLocationsForService("eboo").map((l) => l.name)).toEqual(["Newport Beach"]);
    expect(getLocationsForService("blood-draw")).toHaveLength(2);
    expect(getLocationsForService("not-a-service")).toEqual([]);
  });

  it("getAddOnsForService resolves suggested add-ons in order", () => {
    const hangoverAddOns = getAddOnsForService("iv-hangover").map((a) => a.id);
    expect(hangoverAddOns).toEqual(["b12-addon", "glut-push", "iv-glut-1g", "taurine-addon"]);
    expect(getAddOnsForService("iv-mitochondria")).toEqual([]);
  });

  it("formatPrice renders membership pricing for null and commas for large values", () => {
    expect(formatPrice(null)).toBe("Membership pricing");
    expect(formatPrice(40)).toBe("$40");
    expect(formatPrice(1200)).toBe("$1,200");
  });
});
