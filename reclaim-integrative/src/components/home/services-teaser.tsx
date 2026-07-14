import Image from "next/image";
import Link from "next/link";
import { ScrollReveal } from "@/components/ui/scroll-reveal";

const SERVICES = [
  {
    name: "Hormone Replacement",
    description: "Bioidentical hormones, including Biote pellet therapy.",
    image: "https://picsum.photos/seed/reclaim-hormone/800/1000",
    span: "md:col-span-3 md:row-span-2",
  },
  {
    name: "IV Therapy",
    description: "Customized nutrient infusions.",
    image: "https://picsum.photos/seed/reclaim-iv/800/500",
    span: "md:col-span-3",
  },
  {
    name: "Peptide Therapy",
    description: "Targeted regenerative protocols.",
    image: null,
    span: "md:col-span-2",
  },
  {
    name: "Digestive Health",
    description: "Gut healing and nutrition counseling.",
    image: null,
    span: "md:col-span-1",
  },
];

export function ServicesTeaser() {
  return (
    <ScrollReveal>
      <section className="py-24 px-6 md:px-10">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-serif text-3xl md:text-4xl mb-10 text-center">Care built around you</h2>
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            {SERVICES.map((service) => (
              <div
                key={service.name}
                className={`relative rounded-lg overflow-hidden border border-border min-h-[220px] ${service.span}`}
              >
                {service.image && (
                  <Image
                    src={service.image}
                    alt={`${service.name} at Reclaim Integrative Medicine`}
                    fill
                    className="object-cover"
                  />
                )}
                <div
                  className={`relative h-full flex flex-col justify-end p-6 ${
                    service.image ? "bg-gradient-to-t from-ink/80 to-transparent text-canvas" : "bg-canvas text-ink"
                  }`}
                >
                  <h3 className="font-serif text-xl">{service.name}</h3>
                  <p className="text-sm mt-1 opacity-90">{service.description}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-10">
            <Link href="/services" className="font-sans text-sm underline underline-offset-4 text-ink">
              View all services
            </Link>
          </div>
        </div>
      </section>
    </ScrollReveal>
  );
}
