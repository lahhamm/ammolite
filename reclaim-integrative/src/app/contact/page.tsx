"use client";

import { SiteNav } from "@/components/layout/site-nav";
import { SiteFooter } from "@/components/layout/site-footer";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { Button } from "@/components/ui/button";
import { motion } from "motion/react";
import { Accordion } from "@/components/ui/accordion";
import { faqs } from "@/data/faqs";

export default function ContactPage() {
  return (
    <main className="pt-[72px]">
      <SiteNav />

      <section className="pt-16 pb-16 px-6 md:px-10 max-w-7xl mx-auto grid md:grid-cols-2 gap-16">
        <div>
          <ScrollReveal>
            <h1 className="font-serif text-4xl md:text-5xl mb-6">Start your <br /> health reset.</h1>
            <p className="text-lg text-muted mb-8 max-w-md">
              Whether you&apos;re ready to book or just have questions about our approach, we&apos;re here to help.
            </p>

            <div className="mb-12 border border-accent-sage/40 bg-accent-sage/5 p-6">
              <h2 className="font-serif text-2xl mb-2">Ready to book?</h2>
              <p className="text-muted text-sm mb-5 max-w-sm">
                Choose your service, clinic, and time in a few quiet steps. No phone call needed.
              </p>
              <Button variant="primary" href="/book">
                Book an Appointment
              </Button>
            </div>

            <div className="space-y-8">
              <motion.div
                className="border border-border p-6 hover:bg-accent-sage/5 transition-colors duration-300"
                whileHover={{ x: 4 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
              >
                <h3 className="font-medium text-lg mb-2">Newport Beach</h3>
                <p className="text-muted text-sm">Newport Beach, CA</p>
                <p className="text-ink mt-2 font-medium">(949) 423-3522</p>
              </motion.div>

              <div className="pt-8">
                <h2 className="font-serif text-2xl mb-6">Appointments & Scheduling</h2>
                <Accordion items={faqs.find((f) => f.category === "Appointments & Scheduling")?.questions || []} />
              </div>
            </div>
          </ScrollReveal>
        </div>

        <div>
          <ScrollReveal>
            <form className="bg-white p-8 border border-border flex flex-col gap-6">
              <h2 className="font-serif text-2xl mb-4">Send an Inquiry</h2>
              
              <div className="flex flex-col gap-2">
                <label htmlFor="name" className="text-sm font-medium">Full Name</label>
                <input id="name" type="text" className="border border-border p-3 focus:outline-none focus:border-accent-sage transition-colors" required />
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="email" className="text-sm font-medium">Email Address</label>
                <input id="email" type="email" className="border border-border p-3 focus:outline-none focus:border-accent-sage transition-colors" required />
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="message" className="text-sm font-medium">How can we help you?</label>
                <textarea id="message" rows={4} className="border border-border p-3 focus:outline-none focus:border-accent-sage transition-colors resize-none" required></textarea>
              </div>

              <Button variant="primary" className="w-full justify-center">Send Message</Button>
            </form>
          </ScrollReveal>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
