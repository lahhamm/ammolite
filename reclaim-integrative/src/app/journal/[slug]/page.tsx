"use client";

import Link from "next/link";
import { notFound, useParams } from "next/navigation";
import { SiteNav } from "@/components/layout/site-nav";
import { SiteFooter } from "@/components/layout/site-footer";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { ArrowLeft } from "@phosphor-icons/react/dist/ssr";
import journalData from "@/data/journal.json";

export default function ArticlePage() {
  const params = useParams();
  const slug = params?.slug as string;
  const post = journalData.find((p) => p.slug === slug);

  if (!post) {
    notFound();
  }

  return (
    <main className="bg-canvas min-h-screen flex flex-col selection:bg-accent-sage/20">
      <SiteNav />

      <article className="flex-grow pt-[140px] pb-24">
        {/* Article Header */}
        <header className="px-6 md:px-10 max-w-3xl mx-auto w-full mb-16 text-center">
          <ScrollReveal>
            <div className="flex items-center justify-center gap-4 text-xs tracking-widest uppercase text-muted mb-8 font-medium">
              <span>{post.category}</span>
              <span className="w-1 h-1 bg-accent-sage rounded-full" />
              <time dateTime={post.date}>
                {new Date(post.date).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric"
                })}
              </time>
            </div>
            
            <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl text-ink leading-[1.1] mb-8">
              {post.title}
            </h1>
            
            <div className="w-16 h-[1px] bg-accent-sage/50 mx-auto" />
          </ScrollReveal>
        </header>

        {/* Article Content */}
        <div className="px-6 md:px-10 max-w-[700px] mx-auto w-full">
          <ScrollReveal delay={0.1}>
            <div 
              className="prose prose-lg prose-slate prose-headings:font-serif prose-headings:font-normal prose-headings:text-ink prose-p:text-muted prose-a:text-accent-sage hover:prose-a:text-ink prose-a:transition-colors prose-strong:text-ink max-w-none"
              dangerouslySetInnerHTML={{ __html: post.content }} 
            />
          </ScrollReveal>
        </div>

        {/* Article Footer */}
        <div className="px-6 md:px-10 max-w-[700px] mx-auto w-full mt-24 pt-12 border-t border-border">
          <Link 
            href="/journal" 
            className="inline-flex items-center gap-2 text-sm uppercase tracking-widest font-medium text-muted hover:text-ink transition-colors duration-200"
          >
            <ArrowLeft size={16} weight="bold" />
            Back to Journal
          </Link>
        </div>
      </article>

      <SiteFooter />
    </main>
  );
}
