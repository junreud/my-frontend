"use client";

import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { ChevronDownIcon } from "@heroicons/react/24/solid";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface ItemType {
  id: string;
  label: string;
}

// 항목 리스트
const MENU_ITEMS: ItemType[] = [
  { id: "place", label: "플레이스" },
  { id: "blog", label: "블로그" },
];

export default function MenuPlaces() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // 선택된 아이템
  const [selected, setSelected] = useState<ItemType | null>(null);

  // 페이지 로딩 시 "?id=..." 가져와서 selected 설정
  useEffect(() => {
    const idParam = searchParams.get("id");
    if (!idParam) {
      setSelected(null);
      return;
    }
    // 메뉴 항목에서 해당 id를 찾음
    const found = MENU_ITEMS.find((item) => item.id === idParam);
    setSelected(found ?? null);
  }, [searchParams]);

  // 선택 시 -> URL 갱신
  const handleSelect = (item: ItemType) => {
    setSelected(item);
    // 라우트 변경: /?id=place OR /?id=blog
    router.push(`?id=${item.id}`);
  };

  // 버튼에 표시할 텍스트
  const buttonLabel = selected ? selected.label : "선택하세요";

  return (
    <div className="relative inline-block text-left">
      <Menu>
        {/* Menu Button */}
        <MenuButton
          className="inline-flex items-center gap-2 rounded-md bg-gray-800 py-1.5 px-3 
                     text-sm font-semibold text-white focus:outline-none 
                     hover:bg-gray-700 data-[open]:bg-gray-700"
        >
          {buttonLabel}
          <ChevronDownIcon className="h-4 w-4 fill-white/60" />
        </MenuButton>

        {/* Menu Items */}
        <MenuItems
        className="absolute z-50 mt-2 w-32 origin-top
             left-1/2 -translate-x-1/2
             rounded-md border border-gray-700 bg-gray-800 p-1 text-sm text-white
             shadow-lg focus:outline-none
             transition duration-100 ease-out
             data-[closed]:scale-95 data-[closed]:opacity-0"
>
          {MENU_ITEMS.map((item) => (
            <MenuItem key={item.id}>
              {({ active }) => (
                <button
                  className={`${
                    active ? "bg-gray-700" : ""
                  } block w-full px-3 py-1.5 text-center`}
                  onClick={() => handleSelect(item)}
                >
                  {item.label}
                </button>
              )}
            </MenuItem>
          ))}
        </MenuItems>
      </Menu>
    </div>
  );
}
