"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AlertCircle, ChevronDown, ChevronLeft, ChevronRight, Compass, Search, SearchX, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import { CATEGORY_LABELS, categoryLabel } from "@/lib/format";
import { cn } from "@/lib/utils";
import { CampaignCard } from "./CampaignCard";
import { discoveryApi } from "./discovery.api";
import type { Campaign, Pagination, Sort } from "./discovery.types";

const PAGE_SIZE = 12;
const panel = "rounded-2xl border border-line bg-surface";

export function DiscoverFeed() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [categories, setCategories] = useState<string[]>(Object.keys(CATEGORY_LABELS));
  const [firstLoad, setFirstLoad] = useState(true);
  const [fetching, setFetching] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [sort, setSort] = useState<Sort>("recent");
  const [page, setPage] = useState(1);

  const requestId = useRef(0);

  // Use the backend's category list when it loads, otherwise keep the built-in one
  useEffect(() => {
    discoveryApi
      .categories()
      .then((list) => list?.length && setCategories(list))
      .catch(() => {});
  }, []);

  // Wait until the user stops typing before searching
  useEffect(() => {
    const t = setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 350);
    return () => clearTimeout(t);
  }, [searchInput]);

  const load = useCallback(async () => {
    const id = ++requestId.current;
    setFetching(true);
    setLoadError(null);
    try {
      const data = await discoveryApi.list({
        search: search || undefined,
        category: category || undefined,
        sort,
        page,
        limit: PAGE_SIZE,
      });
      if (id !== requestId.current) return; // a newer request replaced this one
      setCampaigns(data.items);
      setPagination(data.pagination);
    } catch (e) {
      if (id === requestId.current) setLoadError(e instanceof Error ? e.message : "Could not load campaigns");
    } finally {
      if (id === requestId.current) {
        setFetching(false);
        setFirstLoad(false);
      }
    }
  }, [search, category, sort, page]);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = Boolean(search || category);

  function clearFilters() {
    setSearchInput("");
    setSearch("");
    setCategory("");
    setPage(1);
  }

  const from = pagination ? (pagination.page - 1) * pagination.limit + 1 : 0;
  const to = pagination ? Math.min(pagination.page * pagination.limit, pagination.total) : 0;

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative w-full sm:w-96">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-ink-soft" />
          <input
            type="search"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search products"
            aria-label="Search products"
            className="h-11 w-full rounded-xl border border-line bg-surface pl-10 pr-10 text-sm outline-none transition hover:border-ink-soft/40 focus:border-brand focus:ring-4 focus:ring-brand/10 [&::-webkit-search-cancel-button]:hidden"
          />
          {searchInput && (
            <button
              type="button"
              onClick={() => setSearchInput("")}
              aria-label="Clear search"
              className="absolute right-2 top-1/2 grid size-7 -translate-y-1/2 place-items-center rounded-md text-ink-soft hover:bg-canvas hover:text-ink"
            >
              <X className="size-4" />
            </button>
          )}
        </div>

        <div className="relative sm:ml-auto">
          <select
            aria-label="Sort campaigns"
            value={sort}
            onChange={(e) => {
              setSort(e.target.value as Sort);
              setPage(1);
            }}
            className="h-11 appearance-none rounded-xl border border-line bg-surface pl-4 pr-10 text-sm outline-none transition hover:border-ink-soft/40 focus:border-brand focus:ring-4 focus:ring-brand/10"
          >
            <option value="recent">Newest first</option>
            <option value="ending_soon">Ending soon</option>
          </select>
          <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 size-4 -translate-y-1/2 text-ink-soft" />
        </div>
      </div>

      {/* Category chips */}
      <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1" role="group" aria-label="Filter by category">
        {["", ...categories].map((c) => {
          const selected = category === c;
          return (
            <button
              key={c || "all"}
              type="button"
              aria-pressed={selected}
              onClick={() => {
                setCategory(c);
                setPage(1);
              }}
              className={cn(
                "shrink-0 rounded-full border px-4 py-1.5 text-sm transition",
                selected
                  ? "border-brand bg-brand font-medium text-white shadow-[0_6px_14px_-8px] shadow-brand"
                  : "border-line bg-surface text-ink-soft hover:border-ink-soft/40 hover:bg-canvas hover:text-ink"
              )}
            >
              {c ? categoryLabel(c) : "All"}
            </button>
          );
        })}
      </div>

      {/* Result summary */}
      {pagination && !loadError && !firstLoad && pagination.total > 0 && (
        <p className="flex flex-wrap items-center gap-3 text-sm text-ink-soft" aria-live="polite">
          <span>
            <span className="font-semibold text-ink tabular-nums">{pagination.total}</span>{" "}
            {pagination.total === 1 ? "campaign" : "campaigns"} live
            {filtered && " for this search"}
          </span>
          {filtered && (
            <button type="button" onClick={clearFilters} className="inline-flex items-center gap-1 font-medium text-brand hover:underline">
              <X className="size-3.5" /> Clear filters
            </button>
          )}
        </p>
      )}

      {/* Results */}
      {loadError ? (
        <div className={panel}>
          <EmptyState
            icon={AlertCircle}
            title="Couldn't load campaigns"
            description={loadError}
            action={<Button variant="secondary" onClick={load}>Try again</Button>}
          />
        </div>
      ) : firstLoad ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className={cn(panel, "overflow-hidden")}>
              <Skeleton className="aspect-[4/3] w-full rounded-none" />
              <div className="space-y-2.5 p-5">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-3.5 w-28" />
                <Skeleton className="h-3.5 w-full" />
                <Skeleton className="h-3.5 w-3/4" />
              </div>
            </div>
          ))}
        </div>
      ) : campaigns.length === 0 ? (
        <div className={panel}>
          {filtered ? (
            <EmptyState
              icon={SearchX}
              title="No campaigns match"
              description="Try a different search or category."
              action={<Button variant="secondary" onClick={clearFilters}>Clear filters</Button>}
            />
          ) : (
            <EmptyState
              icon={Compass}
              title="No live campaigns yet"
              description="New products show up here as soon as founders publish them."
            />
          )}
        </div>
      ) : (
        <div className={cn("grid gap-6 transition-opacity sm:grid-cols-2 lg:grid-cols-3", fetching && "opacity-60")}>
          {campaigns.map((c) => (
            <CampaignCard key={c.id} campaign={c} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.total > 0 && !loadError && pagination.totalPages > 1 && (
        <div className="flex flex-col items-center justify-between gap-3 border-t border-line pt-5 text-sm text-ink-soft sm:flex-row">
          <span className="tabular-nums">
            Showing {from}–{to} of {pagination.total}
          </span>
          <div className="flex items-center gap-3">
            <span className="tabular-nums">
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <div className="flex gap-2">
              <Button variant="secondary" className="h-9 gap-1 px-3" disabled={page <= 1 || fetching} onClick={() => setPage((p) => p - 1)}>
                <ChevronLeft className="size-4" /> Previous
              </Button>
              <Button
                variant="secondary"
                className="h-9 gap-1 px-3"
                disabled={page >= pagination.totalPages || fetching}
                onClick={() => setPage((p) => p + 1)}
              >
                Next <ChevronRight className="size-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}