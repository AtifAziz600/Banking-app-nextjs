"use client";

import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { formUrlQuery } from "@/lib/utils";

const Pagination = ({ page, totalPages }: PaginationProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleNavigation = (type: "prev" | "next") => {
    const pageValue = type === "prev" ? page - 1 : page + 1;

    const newUrl = formUrlQuery({
      params: searchParams.toString(),
      key: "page",
      value: pageValue.toString(),
    });

    router.push(newUrl, { scroll: false });
  };

  return (
    <div className="flex items-center justify-between">
      <Button
        variant="ghost"
        className="pagination-btn"
        onClick={() => handleNavigation("prev")}
        disabled={page <= 1}
      >
        <Image
          src="/icon/arrow-left.svg"
          width={20}
          height={20}
          alt="arrow"
          className="mr-2"
        />
        Prev
      </Button>

      <p className="text-14 font-medium text-gray-600">
        {page} / {totalPages}
      </p>

      <Button
        variant="ghost"
        className="pagination-btn"
        onClick={() => handleNavigation("next")}
        disabled={page >= totalPages}
      >
        Next
        <Image
          src="/icon/arrow-left.svg"
          width={20}
          height={20}
          alt="arrow"
          className="ml-2 -scale-x-100"
        />
      </Button>
    </div>
  );
};

export default Pagination;
