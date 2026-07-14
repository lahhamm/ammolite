import { Button } from "@/components/ui/button";

export function FinalCta() {
  return (
    <section className="py-24 px-6 md:px-10 text-center bg-ink text-canvas">
      <h2 className="font-serif text-3xl md:text-4xl max-w-xl mx-auto">
        Take the first step toward feeling like yourself again.
      </h2>
      <p className="mt-4 text-canvas/80">A complimentary 15-minute consultation starts the process.</p>
      <div className="mt-8">
        <Button variant="inverse">Schedule Consultation</Button>
      </div>
    </section>
  );
}
