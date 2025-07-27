import apiClient from '@/lib/apiClient';

export interface SEOAnalysisResult {
  representative_photo: SEOItem;
  business_info: SEOItem;
  reservation_talk: SEOItem;
  coupon: SEOItem;
  notice: SEOItem;
  business_hours: SEOItem;
  menu_setting: SEOItem;
  directions: SEOItem;
  keywords: SEOItem;
  reviews: SEOItem;
}

export interface SEOItem {
  score: number;
  details: string;
  status: 'good' | 'warning' | 'error';
  menuData?: {
    totalMenus: number;
    menuWithImages: number;
    menuWithoutImages: number;
    menuBoardImages: number;
    imageRatio: number;
    categories: string[];
    averagePrice: number;
    priceRange: { min: number; max: number };
    menuItems: Array<{
      name: string;
      price: string;
      priceNumber: number;
      description: string;
      hasImage: boolean;
      imageUrl: string;
      category: string;
      position?: number;
    }>;
    top4MenusWithoutImage?: Array<{
      position: number;
      name: string;
    }>;
    warnings?: string[];
  };
  reviewData?: {
    totalReviews: number;
    totalReceiptReviews: number;
    totalBlogReviews: number;
    recent2WeeksReceipt: number;
    recent2WeeksBlog: number;
    replyRate: number;
    totalWithReply: number;
    hasReviewData?: boolean;
    needsCrawling?: boolean;
    lastReceiptReviewDate?: string | null;
    lastBlogReviewDate?: string | null;
  };
}

export interface CompetitorData {
  name: string;
  score: number;
  features: Record<string, boolean>;
}

export interface SEOAnalysisResponse {
  placeInfo: {
    place_id: string;
    place_name: string;
    category: string;
  };
  seoAnalysis: SEOAnalysisResult;
  competitorAnalysis: CompetitorData[];
  overallScore: number;
  analyzedAt: string;
}

export const analyzeSEO = async (placeId: string): Promise<SEOAnalysisResponse> => {
  const response = await apiClient.post('/api/seo/analyze', {
    placeId
  });
  
  if (!response.data.success) {
    throw new Error(response.data.message || 'SEO 분석에 실패했습니다.');
  }
  
  return response.data.data;
};

export interface SEOResultResponse {
  hasResult: boolean;
  message?: string;
  placeInfo?: {
    place_id: string;
    place_name: string;
    category: string;
  };
  seoAnalysis?: SEOAnalysisResult;
  competitorAnalysis?: CompetitorData[];
  overallScore?: number;
  analyzedAt?: string;
}

export const getSEOResult = async (placeId: string): Promise<SEOResultResponse> => {
  const response = await apiClient.get(`/api/seo/result/${placeId}`);
  
  if (!response.data.success) {
    throw new Error(response.data.message || 'SEO 결과 조회에 실패했습니다.');
  }
  
  return response.data.data;
};

export interface CrawlReviewsResponse {
  placeId: string;
  placeName: string;
  receiptReviews: {
    total: number;
    new: number;
    updated: number;
  };
  blogReviews: {
    total: number;
    new: number;
    updated: number;
  };
  crawledAt: string;
}

export const crawlReviewsForSEO = async (placeId: string): Promise<CrawlReviewsResponse> => {
  const response = await apiClient.post('/api/seo/crawl-reviews', {
    placeId
  });
  
  if (!response.data.success) {
    throw new Error(response.data.message || '리뷰 크롤링에 실패했습니다.');
  }
  
  return response.data.data;
};
