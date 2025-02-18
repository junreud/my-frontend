"use client";

import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { ChevronDownIcon } from "@heroicons/react/24/solid";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface ItemType {
  id: string;
  label: string;
}

const MENU_ITEMS: ItemType[] = [
  { id: "place", label: "N-플레이스" },
  { id: "blog",  label: "블로그" },
];

export default function MenuPlaces() {
  const router = useRouter();
  const pathname = usePathname();

  // 현재 선택된 메뉴 상태
  const [selected, setSelected] = useState<ItemType | null>(null);

  // pathname이 바뀔 때마다(예: /service/place -> /service/vlog) selected 업데이트
  useEffect(() => {
    // /service/place → ['', 'service', 'place'] 식으로 split
    const segments = pathname.split("/");
    const maybeId = segments[segments.length - 1];

    const found = MENU_ITEMS.find((item) => item.id === maybeId);
    setSelected(found ?? null);
  }, [pathname]);

  // 메뉴 선택 시 라우터 푸시
  const handleSelect = (item: ItemType) => {
    router.push(`/service/${item.id}`);
  };

  // 버튼에 표시할 라벨
  const buttonLabel = selected ? selected.label : "선택하세요";

  return (
    <div className="relative inline-block text-left">
      <Menu>
        <MenuButton
          className="inline-flex items-center gap-2 rounded-md bg-gray-800 py-1.5 px-3 
                     text-sm font-semibold text-white focus:outline-none 
                     hover:bg-gray-700 data-[open]:bg-gray-700"
        >
          {buttonLabel}
          <ChevronDownIcon className="h-4 w-4 fill-white/60" />
        </MenuButton>

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
