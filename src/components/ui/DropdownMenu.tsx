"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import React, { MouseEvent } from "react";

interface DropdownItem {
  text: string;
  href: string;
}

interface DropdownProps {
  label: string;
  items: DropdownItem[];
}

export default function BigButtonDropdown({ label, items }: DropdownProps) {
  const router = useRouter();

  // 부모 영역 클릭 시 /service로 이동
  const handleClick = () => {
    router.push("/service");
  };

  // 드롭다운 항목 클릭 시, 부모 onClick 방지
  const handleItemClick = (e: MouseEvent<HTMLAnchorElement>) => {
    e.stopPropagation(); 
    // 이걸로 부모 div의 onClick이 실행되지 않게 막음
  };

  return (
    <div
      className="dropdown dropdown-hover relative"
      // onClick을 div에 걸어두어, 어디를 클릭해도 /service 이동
      onClick={handleClick}
    >
      {/* 넓은 버튼 + 화살표 */}
      <div
        tabIndex={0}
        className="flex items-center justify-between w-48"
      >
        {label}
        <svg
          className="ml-2 h-4 w-4 fill-current"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
        >
          <path d="M5.516 7.548L10 12.032l4.484-4.484 1.032 1.032L10 14.096 4.484 8.58z" />
        </svg>
      </div>

      {/* 드롭다운 메뉴 */}
      <ul
        className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52 absolute top-full left-0 mt-1"
        tabIndex={0}
      >
        {items.map((item, idx) => (
          <li key={idx}>
            <Link
              href={item.href}
              onClick={handleItemClick}
              className="block hover:bg-base-200"
            >
              {item.text}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

