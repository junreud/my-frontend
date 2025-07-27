import { BlogPost, BlogCategory, BlogTag } from '@/types/blog';

/**
 * RSS 피드 생성
 */
export const generateRSSFeed = (posts: BlogPost[], siteUrl: string = 'https://lakabe.com'): string => {
  const feedUrl = `${siteUrl}/rss.xml`;

  const rssHeader = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:dc="http://purl.org/dc/elements/1.1/">
  <channel>
    <title>라카비 블로그</title>
    <description>네이버 플레이스 마케팅, 키워드 순위 관리에 대한 최신 정보와 노하우를 공유합니다.</description>
    <link>${siteUrl}/blog</link>
    <language>ko-KR</language>
    <managingEditor>info@lakabe.com (라카비)</managingEditor>
    <webMaster>admin@lakabe.com (라카비 관리자)</webMaster>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${feedUrl}" rel="self" type="application/rss+xml"/>
    <image>
      <url>${siteUrl}/logo.png</url>
      <title>라카비 블로그</title>
      <link>${siteUrl}/blog</link>
    </image>`;

  const rssItems = posts.map(post => `
    <item>
      <title><![CDATA[${post.title}]]></title>
      <description><![CDATA[${post.excerpt}]]></description>
      <content:encoded><![CDATA[${post.content}]]></content:encoded>
      <link>${siteUrl}/blog/${post.slug}</link>
      <guid isPermaLink="true">${siteUrl}/blog/${post.slug}</guid>
      <pubDate>${new Date(post.publishedAt).toUTCString()}</pubDate>
      <dc:creator><![CDATA[${post.author.name}]]></dc:creator>
      ${post.category ? `<category><![CDATA[${post.category.name}]]></category>` : ''}
      ${post.categories.map((cat: BlogCategory) => `<category><![CDATA[${cat.name}]]></category>`).join('')}
      ${post.tags.map((tag: BlogTag) => `<category><![CDATA[${tag.name}]]></category>`).join('')}
      ${post.featuredImage ? 
        `<enclosure url="${siteUrl}${typeof post.featuredImage === 'string' ? post.featuredImage : post.featuredImage.url}" type="image/jpeg"/>` : ''}
    </item>`).join('');

  const rssFooter = `
  </channel>
</rss>`;

  return rssHeader + rssItems + rssFooter;
};

// Atom 피드 생성
export const generateAtomFeed = (posts: BlogPost[]) => {
  const siteUrl = 'https://lakabe.com';
  const feedUrl = `${siteUrl}/atom.xml`;

  const atomHeader = `<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>라카비 블로그</title>
  <subtitle>네이버 플레이스 마케팅, 키워드 순위 관리에 대한 최신 정보와 노하우를 공유합니다.</subtitle>
  <link href="${siteUrl}/blog" rel="alternate"/>
  <link href="${feedUrl}" rel="self"/>
  <id>${siteUrl}/blog</id>
  <updated>${new Date().toISOString()}</updated>
  <author>
    <name>라카비</name>
    <email>info@lakabe.com</email>
  </author>
  <icon>${siteUrl}/favicon.ico</icon>
  <logo>${siteUrl}/logo.png</logo>`;

  const atomEntries = posts.map(post => `
  <entry>
    <title type="html"><![CDATA[${post.title}]]></title>
    <link href="${siteUrl}/blog/${post.slug}" rel="alternate"/>
    <id>${siteUrl}/blog/${post.slug}</id>
    <published>${new Date(post.publishedAt).toISOString()}</published>
    <updated>${new Date(post.publishedAt).toISOString()}</updated>
    <author>
      <name>${post.author}</name>
    </author>
    <summary type="html"><![CDATA[${post.excerpt}]]></summary>
    <content type="html"><![CDATA[${post.content}]]></content>
    <category term="${post.category}"/>
    ${post.tags.map((tag: BlogTag) => `<category term="${tag.name}"/>`).join('')}
  </entry>`).join('');

  const atomFooter = `
</feed>`;

  return atomHeader + atomEntries + atomFooter;
};

// JSON Feed 생성 (최신 표준)
export const generateJSONFeed = (posts: BlogPost[]) => {
  const siteUrl = 'https://lakabe.com';

  return JSON.stringify({
    version: 'https://jsonfeed.org/version/1.1',
    title: '라카비 블로그',
    description: '네이버 플레이스 마케팅, 키워드 순위 관리에 대한 최신 정보와 노하우를 공유합니다.',
    home_page_url: `${siteUrl}/blog`,
    feed_url: `${siteUrl}/feed.json`,
    icon: `${siteUrl}/logo.png`,
    favicon: `${siteUrl}/favicon.ico`,
    language: 'ko-KR',
    authors: [
      {
        name: '라카비',
        url: siteUrl,
      },
    ],
    items: posts.map(post => ({
      id: `${siteUrl}/blog/${post.slug}`,
      url: `${siteUrl}/blog/${post.slug}`,
      title: post.title,
      summary: post.excerpt,
      content_html: post.content,
      date_published: new Date(post.publishedAt).toISOString(),
      date_modified: new Date(post.publishedAt).toISOString(),
      author: {
        name: post.author,
      },
      tags: [...post.tags, post.category],
      image: post.featuredImage,
    })),
  }, null, 2);
};
