import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  // Demo/staging deploys set SITE_NOINDEX=1 so search engines never index a
  // duplicate of the client's live site. Remove the env var when this ships
  // as the real reclaimintegrative.com.
  if (process.env.SITE_NOINDEX) {
    return {
      rules: {
        userAgent: '*',
        disallow: '/',
      },
    };
  }
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/private/'],
    },
    sitemap: 'https://reclaimintegrative.com/sitemap.xml',
  };
}
