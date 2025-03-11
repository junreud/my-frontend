// app/welcome/WelcomePageClient.tsx
"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import apiClient from "@/lib/apiClient";
import LogInHeader from '@/components/LogInPage/LogInHeader';
import { motion, AnimatePresence } from 'framer-motion';

interface CrawlResultItem {
  rank: number;
  keyword: string;
  monthlySearchVolume: number;
}
interface GroupItem {
  rank: number;
  keyword: string;
  monthlySearchVolume: number;
}
interface GroupWithVolume {
  totalVolume: number;
  items: GroupItem[];
  top10: string[];
}

export default function WelcomePageClient() {
  const router = useRouter();

  const [showWelcome, setShowWelcome] = useState(true);
  const [showBusinessForm, setShowBusinessForm] = useState(false);

  const [platform, setPlatform] = useState("");
  const [businessLink, setBusinessLink] = useState("");

  const [showLinkInput, setShowLinkInput] = useState(false);

  const [, setIsFocusedPlatform] = useState(false)
  const [isFocusedLink, setIsFocusedLink] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [progressMessages, setProgressMessages] = useState<string[]>([]);

  const [crawlResults, setCrawlResults] = useState<CrawlResultItem[]>([]);
  const [groups, setGroups] = useState<GroupWithVolume[]>([]);
  const [analysisDone, setAnalysisDone] = useState(false);

  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  // 1) 로그인 여부 체크
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      router.replace("/login");
    }
  }, [router]);

  // 2) Welcome 애니메이션
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowWelcome(false);
      setTimeout(() => {
        setShowBusinessForm(true);
      }, 500);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  const handlePlatformChange = (selected: string) => {
    setPlatform(selected);
    setShowLinkInput(true);
  };

  // OK버튼 클릭 → 분석 시작
  const handleSubmit = async () => {
    if (!platform || !businessLink) return;
    setIsLoading(true);
    setProgressMessages(["업체 분석 시작..."]);

    try {
      // 1) URL 정규화
      setProgressMessages((prev) => [...prev, "업체 찾는중..."]);
      const normalizeRes = await apiClient.get(`/keyword/analysis/normalize`, {
        params: { url: businessLink },
      });
      const normalizeData = normalizeRes.data;
      if (!normalizeData.success) {
        throw new Error(normalizeData.message || "업체찾기 실패");
      }

      // 2) 크롤링 + 검색량
      setProgressMessages((prev) => [...prev, "업체 분석을 시작합니다..."]);
      const crawlRes = await apiClient.post(`/keyword/analysis/crawl`, {
        normalizedUrl: normalizeData.normalizedUrl,
      });
      const crawlData = crawlRes.data;
      if (!crawlData.success) {
        throw new Error(crawlData.message || "분석 실패");
      }
      setCrawlResults(crawlData.externalDataList);

      // 3) 그룹화
      setProgressMessages((prev) => [...prev, "키워드 세부 분석 진행중..."]);
      const groupRes = await apiClient.post(`/keyword/analysis/group`, {
        externalDataList: crawlData.externalDataList,
      });
      const groupDataRes = groupRes.data;
      if (!groupDataRes.success) {
        throw new Error(groupDataRes.message || "키워드 분석 실패");
      }

      if (Array.isArray(groupDataRes.finalKeywords)) {
        const mapped: GroupWithVolume[] = groupDataRes.finalKeywords.map(
          (g: { items: GroupItem[]; top10: string[] }) => {
            const total = g.items.reduce(
              (acc: number, cur: GroupItem) => acc + cur.monthlySearchVolume,
              0
            );
            return { totalVolume: total, items: g.items, top10: g.top10 };
          }
        );
        mapped.sort((a, b) => b.totalVolume - a.totalVolume);
        setGroups(mapped);
      }
      
      setAnalysisDone(true);

      setProgressMessages((prev) => [...prev, "모든 작업이 완료되었습니다!"]);

    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error(error);
        setProgressMessages((prev) => [...prev, `에러 발생: ${error.message}`]);
      } else {
        setProgressMessages((prev) => [...prev, `에러 발생: 알 수 없는 에러`]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const toggleExpand = (index: number) => {
    setExpandedIndex((prev) => (prev === index ? null : index));
  };

  return (
    <>
      <LogInHeader />

      <div className="min-h-screen bg-white flex flex-col items-center justify-center w-full max-w-[1200px] mx-auto px-4">
        
        {/* 1) Welcome 애니메이션 섹션 */}
        <div
          className={`
            transition-opacity duration-500
            ${showWelcome ? "opacity-100" : "opacity-0"}
            text-2xl font-bold text-gray-800
          `}
        >
          반갑습니다.
        </div>

        {showBusinessForm && (
          <div
            className={`
              transition-opacity duration-500 mt-8
              ${showWelcome ? "opacity-0" : "opacity-100"}
            `}
          >
            <div className="bg-white shadow-md p-6 rounded-md w-[400px]">
              <h2 className="text-xl font-semibold mb-4">업체 정보 입력</h2>

              {/* 플랫폼 선택 */}
              <div className="mb-4 relative">
                <label className="block mb-1 text-gray-700 text-sm font-medium">
                  플랫폼 선택
                </label>
                <select
                  className="border border-gray-300 rounded-md w-full px-3 py-3 focus:outline-none focus:ring-2 focus:ring-blue-200 bg-white text-sm"
                  onFocus={() => setIsFocusedPlatform(true)}
                  onBlur={() => {
                    if (!platform) setIsFocusedPlatform(false);
                  }}
                  onChange={(e) => handlePlatformChange(e.target.value)}
                  value={platform}
                >
                  <option value="">플랫폼을 선택하세요</option>
                  <option value="Naver">네이버</option>
                  <option value="Youtube">유튜브</option>
                  <option value="Instagram">인스타그램</option>
                  <option value="Google">구글</option>
                </select>
              </div>

              {/* 업체링크 (플로팅 라벨) */}
              {showLinkInput && (
                <div className="mb-4 relative">
                  <AnimatePresence>
                    {(isFocusedLink || businessLink) && (
                      <motion.label
                        key="businessLinkLabel"
                        initial={{ y: 16, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 16, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="absolute left-3 -top-2 text-xs text-gray-600 bg-white px-1 pointer-events-none"
                        style={{ zIndex: 1 }}
                      >
                        업체 링크
                      </motion.label>
                    )}
                  </AnimatePresence>

                  <motion.input
                    layout
                    type="text"
                    placeholder={
                      isFocusedLink || businessLink ? "" : "업체 링크 (예: https://...)"
                    }
                    className="w-full px-3 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-200 text-sm bg-white border-gray-300"
                    value={businessLink}
                    onFocus={() => setIsFocusedLink(true)}
                    onBlur={() => {
                      if (!businessLink) setIsFocusedLink(false);
                    }}
                    onChange={(e) => setBusinessLink(e.target.value)}
                  />
                </div>
              )}

              {showLinkInput && (
                <button
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 w-full text-sm"
                  onClick={handleSubmit}
                >
                  OK
                </button>
              )}
            </div>
          </div>
        )}

        {/* 진행상황 */}
        <div className="mt-8 w-full max-w-md">
          {progressMessages.map((msg, idx) => (
            <div key={idx} className="text-sm text-gray-700 mb-1">
              {`> ${msg}`}
            </div>
          ))}
        </div>

        {/* 로딩 스피너 */}
        {isLoading && (
          <div className="mt-4">
            <div className="border-4 border-gray-300 border-t-blue-500 rounded-full w-12 h-12 animate-spin" />
          </div>
        )}

        {/* 중간 결과 */}
        {!analysisDone && crawlResults.length > 0 && (
          <div className="mt-8 p-6 shadow-md rounded-md bg-white w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">중간 분석 결과</h3>
            <ul className="space-y-2">
              {crawlResults.map((item) => (
                <li key={item.rank} className="border-b pb-2">
                  <span className="font-medium">
                    {item.rank}위. {item.keyword}
                  </span>
                  <span className="text-gray-500 ml-2">
                    (검색량: {item.monthlySearchVolume.toLocaleString()})
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* 최종 결과 */}
        {analysisDone && groups.length > 0 && (
          <div className="mt-8 p-6 shadow-md rounded-md bg-white w-full max-w-2xl">
            <h3 className="text-lg font-semibold mb-4">
              그룹화된 키워드 목록 (검색량 합 기준 내림차순)
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              클릭하면 이 그룹에 포함된 키워드 목록과 총 검색량이 표시됩니다.
            </p>

            {groups.map((group, idx) => {
              const isExpanded = expandedIndex === idx;
              const groupKeywords = group.items.map((it) => it.keyword).join(", ");

              return (
                <div key={idx} className="mb-4 border-b pb-2">
                  <button
                    type="button"
                    className="w-full text-left"
                    onClick={() => toggleExpand(idx)}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-medium">
                        {groupKeywords.length > 60
                          ? groupKeywords.slice(0, 60) + "..."
                          : groupKeywords
                        }
                      </span>
                      <span>{isExpanded ? "▲" : "▼"}</span>
                    </div>
                  </button>

                  <div
                    className={`transition-all duration-500 overflow-hidden ${
                      isExpanded ? "max-h-[800px] mt-2" : "max-h-0"
                    }`}
                  >
                    <div className="text-gray-500 text-sm mb-2">
                      총 검색량: {group.totalVolume.toLocaleString()}
                    </div>

                    <ul className="pl-4 space-y-1 text-sm">
                      {group.items.map((it) => (
                        <li key={it.rank} className="border-b pb-1">
                          ▸ <strong>{it.keyword}</strong>{" "}
                          (검색량: {it.monthlySearchVolume.toLocaleString()})
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
