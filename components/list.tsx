import { Fragment } from "react";
import { Listbox, Transition } from "@headlessui/react";
import { CheckIcon, ChevronUpDownIcon } from "@heroicons/react/20/solid";

export default function List({
  list,
  ind,
  setInd,
  dispAll = true,
  cn,
}: {
  list: string[];
  ind: number;
  setInd: (ind: number) => void;
  dispAll?: boolean;
  cn?: string;
}) {
  const onChange = (item: string) => {
    const ind = list.findIndex((e) => e === item);
    setInd(ind);
  };

  return (
    <Listbox value={list[ind] || (dispAll ? "Tümü" : "Yükleniyor")} onChange={onChange}>
      <div className={"relative mt-0 w-56 " + (cn || "")}>
        <Listbox.Button className="relative w-full cursor-default rounded-lg bg-white py-1 pl-2 pr-10 text-left shadow-md outline-none focus:outline-none">
          <span className="block truncate">{list[ind] || (dispAll ? "Tümü" : "Yükleniyor")}</span>
          <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
            <ChevronUpDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
          </span>
        </Listbox.Button>
        <Transition as={Fragment} leave="transition ease-in duration-100" leaveFrom="opacity-100" leaveTo="opacity-0">
          <Listbox.Options className="absolute z-50 mt-1 w-full max-h-72 overflow-auto rounded-md bg-white text-sm shadow-lg outline-none focus:outline-none">
            {[...(dispAll ? ["Tümü"] : []), ...list].map((item, ind) => (
              <Listbox.Option
                key={ind}
                className={({ active }) =>
                  `relative cursor-default select-none py-1 pl-8 pr-4 ${active ? "bg-gray-200" : ""}`
                }
                value={item}
              >
                {({ selected }) => (
                  <>
                    <span className={"block truncate text-gray-900"}>{item}</span>
                    {selected ? (
                      <span className="absolute inset-y-0 left-0 flex items-center pl-2 text-gray-900">
                        <CheckIcon className="h-5 w-5" aria-hidden="true" />
                      </span>
                    ) : null}
                  </>
                )}
              </Listbox.Option>
            ))}
          </Listbox.Options>
        </Transition>
      </div>
    </Listbox>
  );
}
