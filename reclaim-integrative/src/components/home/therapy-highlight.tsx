import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { Button } from "@/components/ui/button";

export function TherapyHighlight() {
  return (
    <ScrollReveal>
      <section role="region" aria-label="Advanced therapies" className="py-24 px-6 md:px-10 bg-accent-sage/10">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-serif text-3xl md:text-4xl">Advanced therapies for lasting recovery</h2>
          <p className="mt-4 text-muted max-w-xl mx-auto">
            EBOO blood therapy and BEMER PEMF technology work together to
            improve circulation, oxygenation, and cellular recovery.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-10 text-left">
            <div className="border border-border rounded-lg p-6 bg-canvas">
              <h3 className="font-serif text-xl">EBOO Therapy</h3>
              <p className="text-sm text-muted mt-2">
                Detoxify, oxygenate, and revitalize your blood. Packages starting at $1,170 per session.
              </p>
            </div>
            <div className="border border-border rounded-lg p-6 bg-canvas">
              <h3 className="font-serif text-xl">BEMER PEMF Therapy</h3>
              <p className="text-sm text-muted mt-2">
                Pulsed electromagnetic field technology that stimulates healthy microcirculation.
              </p>
            </div>
          </div>
          <div className="mt-10">
            <Button variant="primary">Schedule Consultation</Button>
          </div>
        </div>
      </section>
    </ScrollReveal>
  );
}
