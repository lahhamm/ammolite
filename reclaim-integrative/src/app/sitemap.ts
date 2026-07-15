import { MetadataRoute } from 'next';
import journalData from '@/data/journal.json';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://reclaimintegrative.com';

  const staticRoutes = [
    '',
    '/services',
    '/conditions-treated',
    '/journal',
    '/contact',
    '/about',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: route === '' ? 1 : 0.8,
  }));

  const journalRoutes = journalData.map((post) => ({
    url: `${baseUrl}/journal/${post.slug}`,
    lastModified: new Date(post.date),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  return [...staticRoutes, ...journalRoutes];
}
