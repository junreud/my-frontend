"use client";
import { Disclosure } from "@headlessui/react";
import { ChevronDownIcon } from "@heroicons/react/20/solid";

// Q&A 데이터 구조 예시
interface FaqItem {
  question: string;
  answer: string;
  defaultOpen?: boolean;
}

interface FaqDisclosuresProps {
  items: FaqItem[];
}

export default function FaqDisclosures({ items }: FaqDisclosuresProps) {
  return (
    <div className="w-full max-w-lg divide-y divide-gray-200 rounded-xl bg-white shadow-md">
      {items.map((item, idx) => (
        <Disclosure
          as="div"
          key={idx}
          className="p-6"
          defaultOpen={item.defaultOpen ?? false}
        >
          {({ open }) => (
            <>
              <Disclosure.Button className="group flex w-full items-center justify-between focus:outline-none">
                <span className="text-base font-medium text-gray-800 group-hover:text-gray-600">
                  {item.question}
                </span>
                <ChevronDownIcon
                  className={`h-5 w-5 text-gray-400 transition-transform group-hover:text-gray-600 
                    ${open ? "rotate-180" : "rotate-0"}`}
                />
              </Disclosure.Button>
              <Disclosure.Panel className="mt-2 text-sm text-gray-600">
                {item.answer}
              </Disclosure.Panel>
            </>
          )}
        </Disclosure>
      ))}
    </div>
  );
}
