"use client";
import { useState } from "react";
import {
  Combobox,
  ComboboxButton,
  ComboboxInput,
  ComboboxOptions,
  ComboboxOption,
} from "@headlessui/react";
import { CheckIcon, ChevronDownIcon } from "@heroicons/react/20/solid";
import clsx from "clsx";

interface Person {
  id: number;
  name: string;
}

const people: Person[] = [
  { id: 1, name: "Tom Cook" },
  { id: 2, name: "Wade Cooper" },
  { id: 3, name: "Tanya Fox" },
];

export default function MyCombobox() {
  // 초기값: 첫 항목을 선택하거나 null
  const [selected, setSelected] = useState<Person | null>(people[0]);
  const [query, setQuery] = useState("");

  // 필터 로직
  const filtered = query === ""
    ? people
    : people.filter((p) => p.name.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="w-52 mx-auto">
      <Combobox
        value={selected}
        onChange={(value) => setSelected(value)}
      >
        <div className="relative">
          <ComboboxInput
            className="w-full p-2 border"
            displayValue={(person: Person | null) => person?.name ?? ""}
            onChange={(e) => setQuery(e.target.value)}
          />
          <ComboboxButton className="absolute right-2 top-2">
            <ChevronDownIcon className="h-4 w-4" />
          </ComboboxButton>
        </div>

        <ComboboxOptions className="w-full border mt-1 bg-white">
          {filtered.map((person) => (
            <ComboboxOption
              key={person.id}
              value={person}
              className="p-2 cursor-pointer hover:bg-gray-100"
            >
              {({ selected }) => (
                <div className="flex items-center gap-2">
                  <CheckIcon
                    className={clsx("h-4 w-4", selected ? "visible" : "invisible")}
                  />
                  <span>{person.name}</span>
                </div>
              )}
            </ComboboxOption>
          ))}
        </ComboboxOptions>
      </Combobox>
    </div>
  );
}
