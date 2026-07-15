import { Suspense } from "react";
import type { Metadata } from "next";
import { SiteNav } from "@/components/layout/site-nav";
import { SiteFooter } from "@/components/layout/site-footer";
import { BookingFlow } from "@/components/booking/booking-flow";

export const metadata: Metadata = {
  title: "Book an Appointment | Reclaim Integrative Medicine",
  description:
    "Choose a service, clinic, and time that works for you at Reclaim Integrative Medicine in Newport Beach and Rancho Cucamonga.",
};

export default function BookPage() {
  return (
    <main className="pt-[72px]">
      <SiteNav />
      <section className="mx-auto max-w-6xl px-6 pb-32 pt-16 md:px-10 lg:pb-24">
        <h1 className="font-serif text-4xl leading-tight text-ink md:text-5xl">
          Book an Appointment
        </h1>
        <p className="mt-4 max-w-xl font-sans text-lg text-muted">
          A few quiet steps: choose your service, pick a clinic and time, and
          we will take care of the rest.
        </p>
        <div className="mt-12">
          <Suspense fallback={<div className="min-h-[400px]" />}>
            <BookingFlow />
          </Suspense>
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
