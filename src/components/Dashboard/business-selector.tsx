"use client"

import React, { useState } from 'react';
import Image from 'next/image';
import { Menu } from '@headlessui/react';
import { ChevronDown, Search, Star } from 'lucide-react';
import { Combobox } from '@headlessui/react';
import { useBusinessSwitcher } from '@/hooks/useBusinessSwitcher';
import { BusinessSheet } from '@/components/Dashboard/BusinessSheet';
import { getPlatformLogo } from '@/lib/getPlatformLogo';
import { useUser } from '@/hooks/useUser';
import apiClient from '@/lib/apiClient';

export function BusinessSelector() {
  const { businesses: raw = [], activeBusiness, setActiveBusiness, sheetOpen, setSheetOpen, canAddMoreBusinesses, refetchBusinesses } = useBusinessSwitcher();
  const { data: user } = useUser();
  // Supported platforms ('' = 전체)
  const platforms = [
    { key: '', label: '전체' },
    { key: 'naver', label: 'Naver' },
    { key: 'instagram', label: 'Instagram' },
    { key: 'facebook', label: 'Facebook' },
  ];
  const [selectedPlatform, setSelectedPlatform] = useState<string>('');
  const [query, setQuery] = useState('');
  // Filter raw list and use server-side is_favorite
  // filter by platform
  const bizList = raw.filter(b => typeof b.place_id === 'string' && (!selectedPlatform || b.platform === selectedPlatform));
  const filtered = bizList.filter(b => b.place_name.toLowerCase().includes(query.toLowerCase()));
  // Toggle favorite
  const toggleFavorite = async (e: React.MouseEvent<HTMLButtonElement>, id: string, current: boolean) => {
    e.stopPropagation();
    if (!user?.id) return;
    try {
      await apiClient.post('/api/place/favorite', {
        userId: user.id,
        place_id: id,
        is_favorite: !current
      });
      refetchBusinesses();
    } catch (err) {
      console.error('Failed to toggle favorite', err);
    }
  };
  return (
    <div className="relative w-full">
      <Combobox value={activeBusiness} onChange={setActiveBusiness} nullable>
        {({ open }) => (
          <div className="flex items-center w-full">
            {/* Independent platform logo trigger */}
            {/* Platform selector */}
            <Menu as="div" className="relative mr-2">
              <Menu.Button className="p-1 rounded hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500" aria-label="Select platform">
                <Image
                  src={getPlatformLogo(selectedPlatform)}
                  alt={`${selectedPlatform} logo`}
                  width={24}
                  height={24}
                />
              </Menu.Button>
              <Menu.Items className="absolute mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-40 min-w-[120px]">
                {platforms.map(plat => (
                  <Menu.Item key={plat.key}>
                    {({ active }) => (
                      <button
                        className={`flex items-center w-full px-3 py-2 ${active ? 'bg-gray-100' : ''}`}
                        onClick={() => {
                          // prevent selecting platforms with no businesses
                          if (plat.key && !raw.some(b => b.platform === plat.key)) {
                            // no companies for this platform
                            return;
                          }
                          setSelectedPlatform(plat.key);
                          setQuery('');
                        }}
                      >
                        {/* show logo if platform, else no icon */}
                        {plat.key ? (
                          <Image
                            src={getPlatformLogo(plat.key)}
                            alt={`${plat.label} logo`}
                            width={20}
                            height={20}
                            className="mr-2 inline-block"
                          />
                        ) : null}
                        {plat.label}
                      </button>
                    )}
                  </Menu.Item>
                ))}
              </Menu.Items>
            </Menu>
            <div className="flex items-center flex-1 border border-gray-300 rounded-lg px-3 py-2 bg-white hover:bg-gray-50 transition">
              {/* visible readonly input to display and enable option clicks */}
              <Combobox.Button className="flex items-center w-full cursor-pointer" aria-label="Toggle business list">
                <span className="flex-1 text-sm truncate text-left">
                  {activeBusiness?.place_name || '업체 선택'}
                </span>
                <ChevronDown className="h-4 w-4 text-gray-600 ml-2 flex-shrink-0" />
              </Combobox.Button>
            </div>
            {open && (
              <div id="business-listbox" className="absolute inset-x-0 top-full mt-1 w-full max-h-60 bg-white border border-gray-200 rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 overflow-auto z-50" data-testid="biz-options">
                {/* 검색창: 옵션 상단 */}
                <div className="px-3 py-2 border-b">
                  <div className="relative">
                    <Search className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      className="w-full pl-8 text-sm focus:outline-none"
                      placeholder="업체 검색..."
                      onChange={e => setQuery(e.target.value)}
                      onMouseDown={e => e.preventDefault()}
                      autoFocus
                      value={query}
                    />
                  </div>
                </div>
                {filtered.filter(b => b.is_favorite).map(b => (
                  <div
                    key={b.place_id}
                    className="flex justify-between items-center px-3 py-2 text-sm hover:bg-gray-50 cursor-pointer"
                    data-testid={`biz-opt-${b.place_id}`}
                    onClick={() => {
                      setActiveBusiness(b);
                    }}
                  >
                    <span className="flex-1 select-none">
                      {b.place_name}
                    </span>
                    <button
                      type="button"
                      onClick={e => {
                        e.stopPropagation();
                        toggleFavorite(e, String(b.place_id), b.is_favorite as boolean);
                      }}
                      className="ml-2 p-1 hover:bg-gray-200 rounded cursor-pointer"
                      aria-label={b.is_favorite ? '즐겨찾기 해제' : '즐겨찾기 추가'}
                    >
                      <Star className={`h-4 w-4 ${b.is_favorite ? 'text-yellow-400' : 'text-gray-300'}`} />
                    </button>
                  </div>
                ))}
                <div>
                  <div className="px-4 py-1 text-xs font-semibold text-gray-400 bg-gray-50">전체 업체</div>
                  {filtered.filter(b => !b.is_favorite).sort((a,b) => a.place_name.localeCompare(b.place_name)).map(b => (
                    <div
                      key={b.place_id}
                      className="flex justify-between items-center px-3 py-2 text-sm hover:bg-gray-50 cursor-pointer"
                      data-testid={`biz-opt-${b.place_id}`}
                      onClick={() => {
                        setActiveBusiness(b);
                      }}
                    >
                      <span className="flex-1 select-none">
                        {b.place_name}
                      </span>
                      <button
                        type="button"
                        onClick={e => {
                          e.stopPropagation();
                          toggleFavorite(e, String(b.place_id), b.is_favorite as boolean);
                        }}
                        className="ml-2 p-1 hover:bg-gray-200 rounded cursor-pointer"
                        aria-label={b.is_favorite ? '즐겨찾기 해제' : '즐겨찾기 추가'}
                      >
                        <Star className={`h-4 w-4 ${b.is_favorite ? 'text-yellow-400' : 'text-gray-300'}`} />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="px-2 py-2 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => setSheetOpen(true)}
                    disabled={!canAddMoreBusinesses}
                    className={`w-full text-left text-sm ${canAddMoreBusinesses ? 'text-blue-600 hover:underline' : 'text-gray-400 cursor-not-allowed'}`}
                    data-testid="biz-add"
                  >
                    + 업체 추가
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </Combobox>
      {/* Render business creation sheet */}
      <BusinessSheet open={sheetOpen} onOpenChange={setSheetOpen} />
    </div>
  );
}
