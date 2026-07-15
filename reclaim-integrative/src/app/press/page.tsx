import { SiteNav } from "@/components/layout/site-nav";
import { SiteFooter } from "@/components/layout/site-footer";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { Marquee } from "@/components/ui/marquee";
import { CountUp } from "@/components/ui/count-up";
import * as motion from "motion/react-client";
import { ArrowUpRight } from "@phosphor-icons/react/dist/ssr";

const PRESS_FEATURES = [
  { outlet: "GQ", title: "Does Magnesium Spray Actually Help Ease Stress and Improve Sleep?", type: "Expert Feature", href: "https://www.gq.com/story/does-magnesium-spray-actually-help-ease-stress-and-improve-sleep" },
  { outlet: "Marie Claire", title: "Hydrotherapy: Benefits, How to Perform the Wellness Practice", type: "Expert Feature", href: "https://www.marieclaire.com/beauty/hydrotherapy-benefits/" },
  { outlet: "Good Housekeeping", title: "What Is Milk Thistle? Benefits, Risks and What Experts Say", type: "Expert Feature", href: "https://www.goodhousekeeping.com/health/wellness/a70175982/milk-thistle-liver-benefits/" },
  { outlet: "Food & Wine", title: "I Asked a Naturopathic Doctor About Flamingo Estate Manuka Honey", type: "Feature", href: "https://www.foodandwine.com/flamingo-estate-manuka-honey-july-2026-12006259" },
  { outlet: "Yahoo Health", title: "8 Common Postpartum Changes to Skin, Body, Hair, and More", type: "Expert Feature", href: "https://health.yahoo.com/your-body/womens-health/articles/8-common-postpartum-changes-skin-145652611.html" },
  { outlet: "Beauty Matter", title: "The Hormonal–Mental Health Nexus and Femtech's Holistic Approach", type: "Feature", href: "https://beautymatter.com/articles/inside-the-hormonal-mental-health-nexus" },
  { outlet: "Authority Magazine", title: "Weight Loss Drugs for Women Over 40", type: "Expert Feature", href: "https://reclaimintegrative.com/blog/authority-magazine-weight-loss-drugs-women-over-40" },
  { outlet: "Hello Mamas", title: "“Normal” Labs but Still Exhausted? Essential Blood Tests for Moms by Life Stage", type: "Expert Feature", href: "https://www.hellomamas.co/blog/the-labs-i-wish-every-mom-knew-to-ask-for" },
  { outlet: "Health+Wellth", title: "Fall 2025 Issue", type: "Feature", href: "https://indd.adobe.com/view/e0fa3047-df94-4409-9abb-f221e33e3460" },
];

const PODCASTS = [
  { name: "High Vibes Mom Club", episode: "HRT, Peptides & IV Therapy for Women 35+", appleHref: "https://podcasts.apple.com/us/podcast/episode-108-hrt-peptides-iv-therapy-for-women-35-the/id1738070424?i=1000770577143" },
  { name: "Peptides for Women Podcast", episode: "How Regenerative Medicine Uses Peptides", appleHref: "https://podcasts.apple.com/us/podcast/episode-25-how-regenerative-medicine-uses-peptides/id1828946787?i=1000743540328", spotifyHref: "https://open.spotify.com/show/3ySOWvLRnTcVLIJjFCt9AQ" },
  { name: "Decoding Social Life", episode: "What Every Man and Woman Should Know", appleHref: "https://podcasts.apple.com/us/podcast/dr-andrea-colon-what-your-doctor-isnt-telling-you-about/id1739425738?i=1000716852845", spotifyHref: "https://open.spotify.com/episode/3BVoNMRthrbyqXXPS3Ux35" },
  { name: "Hot Women Wanted", episode: "Hot Women Wanted Podcast Feature", spotifyHref: "https://open.spotify.com/episode/1PAvWTY8LqM5SO8FnOGDtc" },
  { name: "Salad with a Side of Fries", episode: "What To Do About Your Hormones Including HRT (feat. Dr. Andrea Colon)", appleHref: "https://podcasts.apple.com/us/podcast/salad-with-a-side-of-fries-nutrition-wellness-weight-loss/id1476096152", spotifyHref: "https://open.spotify.com/show/0wsZWuxvW5kKvIfQ0KZxQy" },
];

const STATS = [
  { value: "3B+", label: "Media impressions" },
  { value: "11+", label: "Press features" },
  { value: "7+", label: "Podcast appearances" },
  { value: "117M+", label: "Monthly readers reached" },
];

const MARQUEE_LINKS: Record<string, string> = {
  "GQ": "https://www.gq.com/story/does-magnesium-spray-actually-help-ease-stress-and-improve-sleep",
  "Marie Claire": "https://www.marieclaire.com/beauty/hydrotherapy-benefits/",
  "Food & Wine": "https://www.foodandwine.com/flamingo-estate-manuka-honey-july-2026-12006259",
  "Good Housekeeping": "https://www.goodhousekeeping.com/health/wellness/a70175982/milk-thistle-liver-benefits/",
  "Authority Magazine": "https://reclaimintegrative.com/blog/authority-magazine-weight-loss-drugs-women-over-40",
  "Beauty Matter": "https://beautymatter.com/articles/inside-the-hormonal-mental-health-nexus"
};

const MARQUEE_OUTLETS = [
  "GQ", "Marie Claire", "Good Housekeeping", "Food & Wine",
  "Authority Magazine", "Parents", "VoyageLA", "Beauty Matter",
];

export default function PressPage() {
  return (
    <main className="pt-[72px]">
      <SiteNav />

      <section className="pt-16 pb-12 px-6 md:px-10 text-center max-w-4xl mx-auto">
        <ScrollReveal>
          <span className="text-sm uppercase tracking-widest text-accent-sage font-medium block mb-4">As Seen In</span>
          <h1 className="font-serif text-4xl md:text-5xl mb-6">Press &amp; Media</h1>
        </ScrollReveal>
      </section>

      <Marquee speed={20} pauseOnHover className="mt-0 sm:mt-0 border-y border-border">
        <ul className="flex items-center gap-x-16 px-8">
          {MARQUEE_OUTLETS.map((name) => {
            const href = MARQUEE_LINKS[name];
            const content = (
              <span className="font-serif text-2xl md:text-3xl text-muted/40 whitespace-nowrap hover:text-ink transition-colors duration-300 cursor-pointer">
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

      <section className="py-14 px-6 md:px-10 max-w-5xl mx-auto">
        <ScrollReveal>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {STATS.map((stat) => (
              <div key={stat.label}>
                <p className="font-serif text-3xl text-accent-sage"><CountUp target={stat.value} /></p>
                <p className="text-sm text-muted mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </ScrollReveal>
      </section>

      <section className="py-12 px-6 md:px-10 max-w-6xl mx-auto border-t border-border">
        <ScrollReveal>
          <h2 className="font-serif text-2xl mb-8">Press Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {PRESS_FEATURES.map((item, i) => {
              const isLarge = i === 0;
              const isWide = i === 1 || i === 4 || i === 7 || i === 8;
              const isFull = false;
              const spanClass = isLarge 
                ? "md:col-span-2 md:row-span-2" 
                : isWide 
                  ? "md:col-span-2" 
                  : isFull 
                    ? "md:col-span-4" 
                    : "md:col-span-1";

              return (
                <a 
                  href={item.href} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  key={item.outlet} 
                  className={`block transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-black/10 group ${spanClass}`}
                >
                  <motion.div
                    className="border border-border p-6 md:p-8 bg-white rounded-3xl h-full flex flex-col justify-between gap-8 transition-colors duration-300 relative overflow-hidden"
                    whileHover={{ scale: 0.99 }}
                    transition={{ duration: 0.25, ease: "easeOut" }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-accent-sage/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    
                    <div className="relative z-10 flex items-start justify-between gap-4">
                      <span className="text-xs uppercase tracking-widest text-accent-sage font-medium bg-accent-sage/10 px-3 py-1 rounded-full">{item.type}</span>
                      <ArrowUpRight className="w-5 h-5 text-muted/30 group-hover:text-ink transition-colors duration-300" />
                    </div>
                    
                    <div className="relative z-10 mt-auto">
                      <h3 className={`font-serif text-ink mb-3 ${isLarge ? 'text-3xl md:text-5xl' : 'text-xl md:text-2xl'}`}>{item.outlet}</h3>
                      {item.title && <p className={`text-ink/70 ${isLarge ? 'text-lg md:text-xl max-w-md' : 'text-sm'} line-clamp-3`}>"{item.title}"</p>}
                    </div>
                  </motion.div>
                </a>
              );
            })}
          </div>
        </ScrollReveal>
      </section>

      <section className="py-12 px-6 md:px-10 max-w-6xl mx-auto border-t border-border">
        <ScrollReveal>
          <h2 className="font-serif text-2xl mb-8">Podcast Appearances</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {PODCASTS.map((podcast, i) => {
              const isLarge = i === 0;
              const isWide = i === 1;
              const isFull = i === 4;
              const spanClass = isLarge 
                ? "md:col-span-2 md:row-span-2" 
                : isWide 
                  ? "md:col-span-2" 
                  : isFull 
                    ? "md:col-span-4" 
                    : "md:col-span-1";

              return (
                <div 
                  key={i} 
                  className={`border border-border p-6 md:p-8 bg-white rounded-3xl flex flex-col justify-between gap-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-black/10 group relative overflow-hidden ${spanClass}`}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-accent-sage/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  <div className="relative z-10">
                    <span className="text-xs uppercase tracking-widest text-accent-sage font-medium bg-accent-sage/10 px-3 py-1 rounded-full inline-block mb-8">Podcast</span>
                    <h3 className={`font-serif text-ink mb-3 ${isLarge ? 'text-3xl md:text-5xl max-w-md' : 'text-xl md:text-2xl'}`}>{podcast.name}</h3>
                    {podcast.episode && (
                      <p className={`text-ink/70 ${isLarge ? 'text-lg md:text-xl max-w-sm' : 'text-sm'}`}>"{podcast.episode}"</p>
                    )}
                  </div>
                  
                  <div className="relative z-10 mt-auto flex flex-wrap items-center gap-x-6 gap-y-3 pt-6 border-t border-border/50">
                    {podcast.appleHref && (
                      <a href={podcast.appleHref} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-sm font-medium text-muted hover:text-ink transition-colors group/link">
                        Apple Podcasts
                        <ArrowUpRight weight="light" className="w-4 h-4 group-hover/link:-translate-y-0.5 group-hover/link:translate-x-0.5 transition-transform" />
                      </a>
                    )}
                    {podcast.spotifyHref && (
                      <a href={podcast.spotifyHref} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-sm font-medium text-muted hover:text-ink transition-colors group/link">
                        Spotify
                        <ArrowUpRight weight="light" className="w-4 h-4 group-hover/link:-translate-y-0.5 group-hover/link:translate-x-0.5 transition-transform" />
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollReveal>
      </section>

      <SiteFooter />
    </main>
  );
}
