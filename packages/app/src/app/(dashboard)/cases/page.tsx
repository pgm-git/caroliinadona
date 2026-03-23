"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CaseList } from "@/components/cases/case-list";
import { CaseFilters } from "@/components/cases/case-filters";
import { Plus } from "lucide-react";

// TODO: Replace with real tRPC query when auth is connected
const MOCK_CASES: never[] = [];

export default function CasesPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [caseType, setCaseType] = useState("");

  // Placeholder: in production, use trpc.cases.list.useQuery(...)
  const items = MOCK_CASES;
  const total = 0;
  const totalPages = 0;

  function clearFilters() {
    setSearch("");
    setStatus("");
    setCaseType("");
    setPage(1);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Casos</h1>
          <p className="text-sm text-gray-500">
            Gerencie seus casos e processos
          </p>
        </div>
        <Link href="/cases/new">
          <Button>
            <Plus className="size-4" />
            Novo Caso
          </Button>
        </Link>
      </div>

      <CaseFilters
        search={search}
        onSearchChange={(v) => {
          setSearch(v);
          setPage(1);
        }}
        status={status}
        onStatusChange={(v) => {
          setStatus(v);
          setPage(1);
        }}
        caseType={caseType}
        onCaseTypeChange={(v) => {
          setCaseType(v);
          setPage(1);
        }}
        onClear={clearFilters}
      />

      <CaseList
        items={items}
        total={total}
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
      />
    </div>
  );
}
