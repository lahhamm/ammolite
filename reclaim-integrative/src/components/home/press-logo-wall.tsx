import { ScrollReveal } from "@/components/ui/scroll-reveal";

const PRESS = ["GQ", "Marie Claire", "Good Housekeeping", "Yahoo! Health", "Food & Wine", "Authority Magazine"];

export function PressLogoWall() {
  return (
    <ScrollReveal>
      <section className="py-16 px-6 md:px-10 border-b border-border">
        <ul className="max-w-5xl mx-auto flex flex-wrap items-center justify-center gap-x-12 gap-y-6">
          {PRESS.map((name) => (
            <li key={name} className="font-serif text-lg md:text-xl text-muted">
              {name}
            </li>
          ))}
        </ul>
      </section>
    </ScrollReveal>
  );
}
