"use client";

import Image from "next/image";
import { useSearchParams, useRouter } from "next/navigation";
import { cn, formatAmount, formUrlQuery, getAccountTypeColors } from "@/lib/utils";
import { useState } from "react";

const BankInfo = ({ account, appwriteItemId, type }: BankInfoProps) => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isHovered, setIsHovered] = useState(false);

  const isActive =
    appwriteItemId === account.appwriteItemId ||
    searchParams.get("id") === account.appwriteItemId;

  const handleBankChange = () => {
    const newUrl = formUrlQuery({
      params: searchParams.toString(),
      key: "id",
      value: account.appwriteItemId,
    });
    router.push(newUrl, { scroll: false });
  };

  const colors = getAccountTypeColors(account.type as AccountTypes);

  return (
    <div
      onClick={handleBankChange}
      className={cn(`bank-info ${colors.bg}`, {
        "shadow-sm border-blue-700": type === "card" && isActive,
        "rounded-xl": type === "card",
        "hover:shadow-sm cursor-pointer": type === "card",
      })}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <figure
        className={cn("flex-center h-fit rounded-full bg-blue-100", colors.lightBg)}
      >
        <Image
          src="/icon/dollar-circle.svg"
          width={20}
          height={20}
          alt={account.subtype}
          className="m-2 min-w-5"
        />
      </figure>
      <div className="flex w-full flex-1 flex-col gap-1">
        <div className="flex justify-between">
          <h2 className={cn("text-16 font-semibold text-blue-900", colors.title)}>
            {account.name}
          </h2>
          {type === "full" && (
            <div className={cn("flex-center", colors.lightBg)}>
              <Image
                src="/icon/eye.svg"
                width={20}
                height={20}
                alt="eye"
                className={cn("transition-transform", {
                  "rotate-180": isHovered,
                })}
              />
            </div>
          )}
        </div>
        <p className={cn("text-12 font-medium", colors.subText)}>
          {account.subtype} • {account.currentBalance}
        </p>
      </div>
    </div>
  );
};

export default BankInfo;
