"use client";

import Link from "next/link";
import { useState } from "react";
import { SiteNav } from "@/components/layout/site-nav";
import { SiteFooter } from "@/components/layout/site-footer";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import journalData from "@/data/journal.json";

export default function JournalIndexPage() {
  const [activeCategory, setActiveCategory] = useState("All");

  const categories = ["All", ...Array.from(new Set(journalData.map((post) => post.category)))];

  const filteredPosts = activeCategory === "All" 
    ? journalData 
    : journalData.filter((post) => post.category === activeCategory);

  const featuredPost = filteredPosts[0];
  const gridPosts = filteredPosts.slice(1);

  return (
    <main className="pt-[72px] bg-canvas min-h-screen flex flex-col">
      <SiteNav />

      {/* Header Section */}
      <section className="pt-20 pb-8 px-6 md:px-10 max-w-7xl mx-auto w-full">
        <ScrollReveal>
          <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl leading-tight mb-6 text-ink">
            Journal
          </h1>
          <p className="text-muted text-xl max-w-2xl">
            Naturopathic insights, patient stories, and clinical perspectives on root-cause healing.
          </p>
        </ScrollReveal>
      </section>

      {/* Main Content Layout */}
      <section className="flex-grow px-6 md:px-10 pb-24 max-w-7xl mx-auto w-full flex flex-col md:flex-row gap-12 lg:gap-16">
        
        {/* Sidebar: Categories */}
        <aside className="w-full md:w-48 lg:w-56 shrink-0">
          <div className="sticky top-28">
            <h3 className="text-xs font-semibold text-muted uppercase tracking-widest mb-6">Topics</h3>
            <div className="flex flex-row md:flex-col gap-2 overflow-x-auto md:overflow-visible pb-4 md:pb-0 scrollbar-hide">
              {categories.map((cat) => (
                <button 
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`text-left px-3 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
                    activeCategory === cat 
                      ? "bg-black/5 text-ink" 
                      : "text-muted hover:text-ink hover:bg-black/5"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Right Side: Featured & Grid */}
        <div className="flex-grow flex flex-col gap-16 md:gap-20">
          
          {/* Featured Post */}
          {featuredPost && (
            <ScrollReveal>
              <Link href={`/journal/${featuredPost.slug}`} className="group flex flex-col xl:flex-row gap-8 xl:gap-10 items-center">
                <div className="w-full xl:w-3/5 overflow-hidden rounded-xl aspect-[16/10] bg-black/5 relative shrink-0">
                  <img 
                    src={`https://images.unsplash.com/photo-1498623116890-37e912163d5d?q=80&w=1200&auto=format&fit=crop`} 
                    alt=""
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    loading="lazy"
                  />
                </div>
                <div className="w-full xl:w-2/5 flex flex-col justify-center py-2">
                  <span className="text-xs font-semibold tracking-widest text-accent-sage uppercase mb-4">
                    {featuredPost.category}
                  </span>
                  <h2 className="font-serif text-3xl md:text-4xl leading-tight mb-4 group-hover:text-accent-sage transition-colors duration-200 text-ink">
                    {featuredPost.title}
                  </h2>
                  <p className="text-muted text-lg line-clamp-3 mb-8 leading-relaxed">
                    Explore our latest insights on integrative medicine, discovering the root cause of your symptoms, and building a foundation for long-term vitality.
                  </p>
                  <div className="flex items-center gap-2 text-sm font-medium text-ink group-hover:text-accent-sage transition-colors">
                    Read article <span className="group-hover:translate-x-1 transition-transform duration-200">→</span>
                  </div>
                </div>
              </Link>
            </ScrollReveal>
          )}

          {/* Articles Grid */}
          {gridPosts.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-16">
              {gridPosts.map((post, index) => (
                <ScrollReveal key={post.slug} delay={(index % 2) * 0.1}>
                  <Link href={`/journal/${post.slug}`} className="group block h-full">
                    <article className="flex flex-col h-full">
                      <div className="aspect-[16/10] w-full overflow-hidden rounded-xl bg-black/5 mb-6 relative">
                        <img 
                          src={`https://picsum.photos/seed/${post.slug}/800/500`} 
                          alt="" 
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                          loading="lazy"
                        />
                      </div>
                      
                      <div className="flex flex-col flex-grow">
                        <span className="text-xs font-semibold tracking-widest uppercase text-accent-sage mb-3">
                          {post.category}
                        </span>
                        
                        <h3 className="font-serif text-xl md:text-2xl text-ink leading-snug mb-3 group-hover:text-accent-sage transition-colors duration-200 line-clamp-2">
                          {post.title}
                        </h3>
                        
                        <div className="mt-auto pt-4 flex items-center gap-2">
                          <span className="text-sm font-medium text-muted group-hover:text-accent-sage transition-colors duration-200">
                            Read article
                          </span>
                        </div>
                      </div>
                    </article>
                  </Link>
                </ScrollReveal>
              ))}
            </div>
          )}

        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
