/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.SITE_URL || 'https://lakabe.com',
  generateRobotsTxt: false, // 수동으로 관리하므로 false
  generateIndexSitemap: true,
  
  // 추가할 페이지들
  additionalPaths: async (config) => [
    await config.transform(config, '/'),
    await config.transform(config, '/about'),
    await config.transform(config, '/service'),
    await config.transform(config, '/blog'),
    await config.transform(config, '/company-info'),
    await config.transform(config, '/contact'),
    await config.transform(config, '/support'),
    await config.transform(config, '/faq'),
    await config.transform(config, '/estimate'),
    await config.transform(config, '/terms'),
    await config.transform(config, '/privacy'),
  ],
  
  // 제외할 경로
  exclude: [
    '/dashboard/*',
    '/api/*',
    '/admin/*',
    '/server-sitemap.xml',
  ],
  
  // robots.txt 설정
  robotsTxtOptions: {
    policies: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/dashboard/', '/api/', '/_next/', '/admin/'],
      },
    ],
    additionalSitemaps: [
      'https://lakabe.com/server-sitemap.xml', // 동적 사이트맵
    ],
  },
  
  // 우선순위 설정
  transform: async (config, path) => {
    const priority = getPriority(path);
    const changefreq = getChangeFreq(path);
    
    return {
      loc: path,
      changefreq,
      priority,
      lastmod: config.autoLastmod ? new Date().toISOString() : undefined,
    };
  },
};

function getPriority(path) {
  if (path === '/') return 1.0;
  if (path === '/service') return 0.9;
  if (path.includes('/blog') || path === '/about' || path === '/estimate') return 0.8;
  if (path === '/company-info' || path === '/contact') return 0.7;
  if (path === '/support' || path === '/faq') return 0.6;
  if (path === '/terms' || path === '/privacy') return 0.4;
  return 0.5;
}

function getChangeFreq(path) {
  if (path === '/' || path.includes('/blog')) return 'daily';
  if (path === '/service' || path === '/estimate' || path === '/support' || path === '/faq') return 'weekly';
  if (path === '/about' || path === '/company-info' || path === '/contact') return 'monthly';
  if (path === '/terms' || path === '/privacy') return 'yearly';
  return 'monthly';
}
