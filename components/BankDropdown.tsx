"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { cn, formUrlQuery } from "@/lib/utils";

const BankDropdown = ({ accounts = [], setValue, otherStyles }: BankDropdownProps) => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState(accounts[0] || null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleAccountSelect = (account: Account) => {
    setSelectedAccount(account);
    setIsOpen(false);

    const newUrl = formUrlQuery({
      params: searchParams.toString(),
      key: "id",
      value: account.appwriteItemId,
    });
    router.push(newUrl, { scroll: false });

    if (setValue) {
      setValue("senderBank", account.appwriteItemId);
    }
  };

  return (
    <div className={`relative ${otherStyles}`} ref={dropdownRef}>
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="flex cursor-pointer items-center gap-3 rounded-lg border border-gray-200 bg-white px-4 py-3 shadow-form"
      >
        <Image
          src="/icon/dollar-circle.svg"
          width={20}
          height={20}
          alt="bank"
          className="w-5 h-5"
        />
        <div className="flex flex-1 items-center justify-between">
          <p className="text-16 font-medium text-gray-900 truncate max-w-[150px]">
            {selectedAccount?.name ?? "Select account"}
          </p>
          <Image
            src="/icon/arrow-down.svg"
            width={16}
            height={16}
            alt="arrow"
            className={cn("transition-transform", {
              "rotate-180": isOpen,
            })}
          />
        </div>
      </div>

      {isOpen && (
        <div className="absolute left-0 top-full z-50 mt-2 w-full rounded-lg border border-gray-200 bg-white shadow-lg">
          <div className="max-h-[200px] overflow-y-auto">
            {accounts.map((account) => (
              <div
                key={account.appwriteItemId}
                onClick={() => handleAccountSelect(account)}
                className={cn(
                  "flex cursor-pointer items-center gap-3 px-4 py-3 hover:bg-gray-50",
                  {
                    "bg-blue-50": selectedAccount?.appwriteItemId === account.appwriteItemId,
                  }
                )}
              >
                <Image
                  src="/icon/dollar-circle.svg"
                  width={20}
                  height={20}
                  alt="bank"
                  className="w-5 h-5"
                />
                <p className="text-14 font-medium text-gray-900 truncate">
                  {account.name}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default BankDropdown;
