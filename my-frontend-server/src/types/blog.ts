// Blog related types
export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  publishedAt: Date;
  updatedAt: Date;
  author: BlogAuthor;
  categories: BlogCategory[];
  tags: BlogTag[];
  featuredImage?: string | {
    url: string;
    alt: string;
    width?: number;
    height?: number;
  };
  status: 'draft' | 'published' | 'archived';
  seoMetadata?: SEOMetadata;
  readingTime?: number;
  wordCount?: number;
  isPublished?: boolean;
  isFeatured?: boolean;
  category?: BlogCategory; // 하위 호환성을 위해
}

export interface BlogAuthor {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  bio?: string;
  social?: {
    twitter?: string;
    github?: string;
    linkedin?: string;
    website?: string;
  };
}

export interface BlogCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  color?: string;
  icon?: string;
  postCount?: number;
  seo?: SEOMetadata;
}

export interface BlogTag {
  id: string;
  name: string;
  slug: string;
  description?: string;
  color?: string;
  postCount?: number;
}

export interface BlogArchive {
  year: number;
  month: number;
  posts: BlogPost[];
  postCount: number;
}

export interface BlogStats {
  totalPosts: number;
  totalCategories?: number;
  totalTags?: number;
  totalViews: number;
  totalComments: number;
  averageReadTime: number;
  topCategories: Array<{
    category: BlogCategory;
    postCount: number;
  }>;
  topTags: Array<{
    tag: BlogTag;
    postCount: number;
  }>;
  mostPopularPosts?: BlogPost[];
  mostPopularCategories?: BlogCategory[];
  mostPopularTags?: BlogTag[];
}

export interface BlogSearch {
  query: string;
  results: BlogPost[];
  totalResults: number;
  currentPage?: number;
  totalPages?: number;
  categories?: BlogCategory[];
  tags?: BlogTag[];
  filters?: {
    categories?: string[];
    tags?: string[];
    dateRange?: {
      start: Date;
      end: Date;
    };
  };
  facets?: {
    category: string;
    tags: string[];
    dateRange: {
      start: string;
      end: string;
    };
  };
}

export interface BlogNavigation {
  recentPosts?: BlogPost[];
  categories?: BlogCategory[];
  tags?: BlogTag[];
  archives?: BlogArchive[];
  next?: {
    title: string;
    slug: string;
    excerpt: string;
  };
  previous?: {
    title: string;
    slug: string;
    excerpt: string;
  };
}

export interface SEOMetadata {
  title?: string;
  description?: string;
  keywords?: string[];
  ogImage?: string;
  canonicalUrl?: string;
}

export interface BlogTableOfContents {
  id: string;
  title: string;
  level: number;
  children: TOCItem[];
}

export interface TOCItem {
  id: string;
  title: string;
  level: number;
  children?: TOCItem[];
}

export interface BlogSitemap {
  posts: BlogSitemapItem[];
  categories?: BlogSitemapItem[];
  tags?: BlogSitemapItem[];
  lastModified: Date;
}

export interface BlogSitemapItem {
  url?: string;
  slug?: string;
  lastModified?: Date;
  lastmod?: Date | string;
  changeFrequency?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority?: number;
}

export interface BlogAnalytics {
  postId: string;
  views: number;
  likes: number;
  shares: number;
  comments: number;
  readTime: number;
  bounceRate: number;
}

export interface BlogComment {
  id: string;
  postId: string;
  author: {
    name: string;
    email: string;
    avatar?: string;
  };
  content: string;
  createdAt: Date;
  parentId?: string;
  status: 'approved' | 'pending' | 'rejected';
}
