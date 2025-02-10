"use client";
import React from "react";
import Link from "next/link";

export default function DropdownMenu({ label, items }) {
  return (
    <div className="dropdown dropdown-hover dropdown-bottom">
      <label
        tabIndex={0}
        className="cursor-pointer flex items-center"
        aria-label={label}
      >
        {label}
        <svg
          className="ml-1 h-4 w-4 fill-current"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
        >
          <path d="M5.516 7.548L10 12.032l4.484-4.484 1.032 1.032L10 14.096 4.484 8.58z" />
        </svg>
      </label>
      <ul className="dropdown-content menu p-1 shadow bg-base-100 rounded-box w-52">
        {items.map((item, index) => (
          <li key={index}>
            {item.href ? (
              <Link href={item.href}>{item.text}</Link>
            ) : (
              <span>{item.text}</span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
