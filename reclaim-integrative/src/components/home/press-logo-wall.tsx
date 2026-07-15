import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { Marquee } from "@/components/ui/marquee";

const PRESS_LINKS: Record<string, string> = {
  "GQ": "https://www.gq.com/story/does-magnesium-spray-actually-help-ease-stress-and-improve-sleep",
  "Marie Claire": "https://www.marieclaire.com/beauty/hydrotherapy-benefits/",
  "Food & Wine": "https://www.foodandwine.com/flamingo-estate-manuka-honey-july-2026-12006259",
  "Good Housekeeping": "https://www.goodhousekeeping.com/health/wellness/a70175982/milk-thistle-liver-benefits/",
  "Authority Magazine": "/journal/authority-magazine-weight-loss-drugs-women-over-40",
  "Beauty Matter": "https://beautymatter.com/articles/inside-the-hormonal-mental-health-nexus"
};

const PRESS = ["GQ", "Marie Claire", "Good Housekeeping", "Food & Wine", "Authority Magazine", "VoyageLA", "Beauty Matter"];

export function PressLogoWall() {
  return (
    <ScrollReveal>
      <section className="py-16 border-b border-border bg-canvas">
        <p className="text-center text-xs uppercase tracking-widest text-muted font-medium mb-6">As Seen In</p>
        <Marquee speed={25} pauseOnHover className="mt-0 sm:mt-0">
          <ul className="flex items-center gap-x-16 px-8">
            {PRESS.map((name) => {
              const href = PRESS_LINKS[name];
              const content = (
                <span className="font-serif text-2xl md:text-3xl text-muted/50 whitespace-nowrap hover:text-ink transition-colors duration-300 cursor-pointer">
                  {name}
                </span>
              );
              
              return (
                <li key={name}>
                  {href ? (
                    <a href={href} target="_blank" rel="noopener noreferrer" className="block">
                      {content}
                    </a>
                  ) : (
                    content
                  )}
                </li>
              );
            })}
          </ul>
        </Marquee>
      </section>
    </ScrollReveal>
  );
}
