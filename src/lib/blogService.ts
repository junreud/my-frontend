import { 
  BlogPost, 
  BlogCategory, 
  BlogTag, 
  BlogArchive, 
  BlogStats, 
  BlogSearch, 
  BlogNavigation,
  BlogTableOfContents,
  BlogSitemap
} from '@/types/blog';

// 예시 데이터 (실제 프로젝트에서는 API나 CMS에서 가져와야 함)
export const sampleBlogPosts: BlogPost[] = [
  {
    id: '1',
    title: 'Next.js 15의 새로운 기능들',
    slug: 'nextjs-15-new-features',
    excerpt: 'Next.js 15에서 새롭게 추가된 기능들과 성능 개선사항을 알아보세요.',
    content: `
      # Next.js 15의 새로운 기능들

      Next.js 15는 많은 새로운 기능과 성능 개선사항을 제공합니다...
    `,
    publishedAt: new Date('2024-01-15T10:00:00Z'),
    updatedAt: new Date('2024-01-15T10:00:00Z'),
    author: {
      id: '1',
      name: '김개발자',
      email: 'developer@example.com',
      bio: '프론트엔드 개발자',
      avatar: '/images/authors/author1.jpg',
      social: {
        twitter: '@developer_kim',
        github: 'developer-kim'
      }
    },
    categories: [{
      id: '1',
      name: '웹 개발',
      slug: 'web-development',
      description: '웹 개발 관련 포스트',
      color: '#3B82F6'
    }],
    tags: [
      { id: '1', name: 'Next.js', slug: 'nextjs', color: '#000000' },
      { id: '2', name: 'React', slug: 'react', color: '#61DAFB' },
      { id: '3', name: 'JavaScript', slug: 'javascript', color: '#F7DF1E' }
    ],
    featuredImage: {
      url: '/images/posts/nextjs-15.jpg',
      alt: 'Next.js 15 로고',
      width: 1200,
      height: 630
    },
    seoMetadata: {
      title: 'Next.js 15의 새로운 기능들 - 완전 가이드',
      description: 'Next.js 15에서 새롭게 추가된 기능들과 성능 개선사항을 자세히 알아보세요.',
      keywords: ['Next.js', 'React', '웹개발', 'JavaScript', '프론트엔드'],
      ogImage: '/images/og/nextjs-15.jpg'
    },
    status: 'published'
  },
  {
    id: '2',
    title: 'SEO 최적화 완벽 가이드',
    slug: 'seo-optimization-guide',
    excerpt: '웹사이트의 검색 엔진 최적화를 위한 실전 가이드입니다.',
    content: `
      # SEO 최적화 완벽 가이드

      검색 엔진 최적화는 웹사이트의 성공에 필수적입니다...
    `,
    publishedAt: new Date('2024-01-10T14:30:00Z'),
    updatedAt: new Date('2024-01-10T14:30:00Z'),
    author: {
      id: '2',
      name: '박마케터',
      email: 'marketer@example.com',
      bio: '디지털 마케팅 전문가',
      avatar: '/images/authors/author2.jpg',
      social: {
        linkedin: 'marketer-park'
      }
    },
    categories: [{
      id: '2',
      name: '디지털 마케팅',
      slug: 'digital-marketing',
      description: '디지털 마케팅 관련 포스트',
      color: '#10B981'
    }],
    tags: [
      { id: '4', name: 'SEO', slug: 'seo', color: '#059669' },
      { id: '5', name: '마케팅', slug: 'marketing', color: '#7C3AED' },
      { id: '6', name: '웹사이트', slug: 'website', color: '#DC2626' }
    ],
    featuredImage: {
      url: '/images/posts/seo-guide.jpg',
      alt: 'SEO 최적화 가이드',
      width: 1200,
      height: 630
    },
    seoMetadata: {
      title: 'SEO 최적화 완벽 가이드 - 검색 상위 랭킹 달성하기',
      description: '웹사이트의 검색 엔진 최적화를 위한 실전 가이드와 팁을 알아보세요.',
      keywords: ['SEO', '검색엔진최적화', '마케팅', '웹사이트', '구글', '네이버'],
      ogImage: '/images/og/seo-guide.jpg'
    },
    status: 'published'
  }
];

export const sampleCategories: BlogCategory[] = [
  {
    id: '1',
    name: '웹 개발',
    slug: 'web-development',
    description: '웹 개발 관련 포스트들',
    color: '#3B82F6',
    icon: '💻',
    postCount: 15,
    seo: {
      title: '웹 개발 - 최신 트렌드와 기술',
      description: '웹 개발의 최신 트렌드, 기술, 그리고 실무 경험을 공유합니다.',
      keywords: ['웹개발', 'JavaScript', 'React', 'Next.js', '프론트엔드', '백엔드']
    }
  },
  {
    id: '2',
    name: '디지털 마케팅',
    slug: 'digital-marketing',
    description: '디지털 마케팅 전략과 트렌드',
    color: '#10B981',
    icon: '📈',
    postCount: 8,
    seo: {
      title: '디지털 마케팅 - 성공적인 온라인 마케팅 전략',
      description: '디지털 마케팅의 최신 트렌드와 효과적인 전략을 알아보세요.',
      keywords: ['디지털마케팅', 'SEO', '소셜미디어', '콘텐츠마케팅', '구글광고', '네이버광고']
    }
  }
];

export const sampleTags: BlogTag[] = [
  { id: '1', name: 'Next.js', slug: 'nextjs', color: '#000000', postCount: 5 },
  { id: '2', name: 'React', slug: 'react', color: '#61DAFB', postCount: 8 },
  { id: '3', name: 'JavaScript', slug: 'javascript', color: '#F7DF1E', postCount: 12 },
  { id: '4', name: 'SEO', slug: 'seo', color: '#059669', postCount: 3 },
  { id: '5', name: '마케팅', slug: 'marketing', color: '#7C3AED', postCount: 6 },
  { id: '6', name: '웹사이트', slug: 'website', color: '#DC2626', postCount: 4 }
];

/**
 * 블로그 포스트 조회
 */
export async function getBlogPosts(
  options: {
    limit?: number;
    offset?: number;
    category?: string;
    tag?: string;
    featured?: boolean;
    published?: boolean;
    search?: string;
  } = {}
): Promise<BlogPost[]> {
  let posts = [...sampleBlogPosts];

  // 필터링
  if (options.category) {
    posts = posts.filter(post => 
      post.category?.slug === options.category || 
      post.categories.some(cat => cat.slug === options.category)
    );
  }

  if (options.tag) {
    posts = posts.filter(post => 
      post.tags.some(tag => tag.slug === options.tag)
    );
  }

  if (options.featured !== undefined) {
    posts = posts.filter(post => post.isFeatured === options.featured);
  }

  if (options.published !== undefined) {
    posts = posts.filter(post => post.isPublished === options.published);
  }

  if (options.search) {
    const searchQuery = options.search.toLowerCase();
    posts = posts.filter(post =>
      post.title.toLowerCase().includes(searchQuery) ||
      post.excerpt.toLowerCase().includes(searchQuery) ||
      post.content.toLowerCase().includes(searchQuery)
    );
  }

  // 정렬 (최신순)
  posts.sort((a, b) => 
    new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );

  // 페이징
  const offset = options.offset || 0;
  const limit = options.limit || posts.length;
  
  return posts.slice(offset, offset + limit);
}

/**
 * 단일 블로그 포스트 조회
 */
export async function getBlogPost(slug: string): Promise<BlogPost | null> {
  const post = sampleBlogPosts.find(p => p.slug === slug);
  return post || null;
}

/**
 * 블로그 카테고리 조회
 */
export async function getBlogCategories(): Promise<BlogCategory[]> {
  return sampleCategories;
}

/**
 * 블로그 태그 조회
 */
export async function getBlogTags(): Promise<BlogTag[]> {
  return sampleTags;
}

/**
 * 블로그 통계 조회
 */
export async function getBlogStats(): Promise<BlogStats> {
  const posts = await getBlogPosts({ published: true });
  const categories = await getBlogCategories();
  const tags = await getBlogTags();

  return {
    totalPosts: posts.length,
    totalCategories: categories.length,
    totalTags: tags.length,
    totalViews: posts.reduce((sum, post) => sum + (post.id === '1' ? 1500 : 800), 0),
    totalComments: 0,
    averageReadTime: Math.round(
      posts.reduce((sum, post) => sum + (post.readingTime || 0), 0) / posts.length
    ),
    topCategories: categories.slice(0, 3).map(category => ({
      category,
      postCount: category.postCount || 0
    })),
    topTags: tags.slice(0, 10).map(tag => ({
      tag,
      postCount: tag.postCount || 0
    })),
    mostPopularPosts: posts.slice(0, 5),
    mostPopularCategories: categories.slice(0, 3),
    mostPopularTags: tags.slice(0, 10)
  };
}

/**
 * 블로그 아카이브 조회
 */
export async function getBlogArchive(): Promise<BlogArchive[]> {
  const posts = await getBlogPosts({ published: true });
  const archiveMap = new Map<string, BlogPost[]>();

  posts.forEach(post => {
    const date = new Date(post.publishedAt);
    const key = `${date.getFullYear()}-${date.getMonth()}`;
    
    if (!archiveMap.has(key)) {
      archiveMap.set(key, []);
    }
    archiveMap.get(key)!.push(post);
  });

  const archives: BlogArchive[] = [];
  archiveMap.forEach((posts, key) => {
    const [year, month] = key.split('-').map(Number);
    archives.push({
      year,
      month,
      postCount: posts.length,
      posts
    });
  });

  // 최신순 정렬
  return archives.sort((a, b) => {
    if (a.year !== b.year) return b.year - a.year;
    return b.month - a.month;
  });
}

/**
 * 블로그 검색
 */
export async function searchBlog(query: string): Promise<BlogSearch> {
  const posts = await getBlogPosts({ search: query, published: true });
  const categories = await getBlogCategories();
  const tags = await getBlogTags();

  return {
    query,
    results: posts,
    totalResults: posts.length,
    categories,
    tags,
    facets: {
      category: '',
      tags: [],
      dateRange: {
        start: '',
        end: ''
      }
    }
  };
}

/**
 * 블로그 네비게이션 (이전/다음 포스트)
 */
export async function getBlogNavigation(currentSlug: string): Promise<BlogNavigation> {
  const posts = await getBlogPosts({ published: true });
  const currentIndex = posts.findIndex(p => p.slug === currentSlug);
  
  if (currentIndex === -1) {
    return {};
  }

  const navigation: BlogNavigation = {};

  if (currentIndex > 0) {
    const next = posts[currentIndex - 1];
    navigation.next = {
      title: next.title,
      slug: next.slug,
      excerpt: next.excerpt
    };
  }

  if (currentIndex < posts.length - 1) {
    const previous = posts[currentIndex + 1];
    navigation.previous = {
      title: previous.title,
      slug: previous.slug,
      excerpt: previous.excerpt
    };
  }

  return navigation;
}

/**
 * 목차 생성
 */
export function generateTableOfContents(content: string): BlogTableOfContents[] {
  const headings = content.match(/^#{1,6}\s.+$/gm) || [];
  const toc: BlogTableOfContents[] = [];

  headings.forEach((heading) => {
    const level = heading.match(/^#+/)?.[0].length || 1;
    const title = heading.replace(/^#+\s/, '');
    const id = title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

    toc.push({
      id,
      title,
      level,
      children: []
    });
  });

  return toc;
}

/**
 * 블로그 사이트맵 데이터 생성
 */
export async function getBlogSitemap(): Promise<BlogSitemap> {
  const posts = await getBlogPosts({ published: true });
  const categories = await getBlogCategories();
  const tags = await getBlogTags();

  return {
    posts: posts.map(post => ({
      slug: post.slug,
      lastmod: post.updatedAt,
      priority: post.isFeatured ? 0.8 : 0.6
    })),
    categories: categories.map(category => ({
      slug: category.slug,
      lastmod: new Date().toISOString(),
      priority: 0.7
    })),
    tags: tags.map(tag => ({
      slug: tag.slug,
      lastmod: new Date().toISOString(),
      priority: 0.5
    })),
    lastModified: new Date()
  };
}

/**
 * 관련 포스트 조회
 */
export async function getRelatedPosts(
  currentPost: BlogPost,
  limit: number = 3
): Promise<BlogPost[]> {
  const allPosts = await getBlogPosts({ published: true });
  
  // 현재 포스트 제외
  const otherPosts = allPosts.filter(p => p.id !== currentPost.id);
  
  // 관련도 계산 (카테고리, 태그 기반)
  const scoredPosts = otherPosts.map(post => {
    let score = 0;
    
    // 같은 카테고리
    if (post.category && currentPost.category && post.category.id === currentPost.category.id) {
      score += 3;
    }
    
    // 공통 태그
    const commonTags = post.tags.filter(tag =>
      currentPost.tags.some(currentTag => currentTag.id === tag.id)
    );
    score += commonTags.length;
    
    return { post, score };
  });
  
  // 점수순 정렬 후 상위 N개 반환
  return scoredPosts
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(item => item.post);
}

/**
 * 읽기 시간 계산
 */
export function calculateReadingTime(content: string): number {
  const wordsPerMinute = 200; // 평균 읽기 속도
  const words = content.split(/\s+/).length;
  return Math.ceil(words / wordsPerMinute);
}

/**
 * 단어 수 계산
 */
export function calculateWordCount(content: string): number {
  return content.split(/\s+/).filter(word => word.length > 0).length;
}
