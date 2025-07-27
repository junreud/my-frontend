import { NextResponse } from 'next/server'

export async function GET() {
  const siteUrl = 'https://lakabe.com'
  const currentDate = new Date().toISOString()
  
  const rssContent = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>라카비 - 네이버 플레이스 마케팅 솔루션</title>
    <description>네이버 플레이스 키워드 순위 관리, 리뷰 관리, 블로그 마케팅 정보와 팁을 제공합니다.</description>
    <link>${siteUrl}</link>
    <atom:link href="${siteUrl}/rss.xml" rel="self" type="application/rss+xml"/>
    <language>ko-KR</language>
    <lastBuildDate>${currentDate}</lastBuildDate>
    <managingEditor>info@lakabe.com (라카비)</managingEditor>
    <webMaster>info@lakabe.com (라카비)</webMaster>
    
    <item>
      <title>라카비 서비스 소개</title>
      <description>네이버 플레이스 키워드 순위 추적, 리뷰 관리, 블로그 마케팅을 한 번에 관리할 수 있는 라카비 서비스를 소개합니다.</description>
      <link>${siteUrl}/service</link>
      <guid>${siteUrl}/service</guid>
      <pubDate>${currentDate}</pubDate>
    </item>
    
    <item>
      <title>네이버 플레이스 SEO 최적화 가이드</title>
      <description>네이버 플레이스에서 상위 노출을 위한 SEO 최적화 방법과 팁을 알려드립니다.</description>
      <link>${siteUrl}/blog</link>
      <guid>${siteUrl}/blog</guid>
      <pubDate>${currentDate}</pubDate>
    </item>
    
    <item>
      <title>지역 비즈니스 마케팅 전략</title>
      <description>지역 비즈니스를 위한 효과적인 디지털 마케팅 전략과 실행 방법을 제공합니다.</description>
      <link>${siteUrl}/about</link>
      <guid>${siteUrl}/about</guid>
      <pubDate>${currentDate}</pubDate>
    </item>
  </channel>
</rss>`

  return new NextResponse(rssContent, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600', // 1시간 캐시
    },
  })
}
