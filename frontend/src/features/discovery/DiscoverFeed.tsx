"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AlertCircle, Compass, Search, SearchX } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import { CATEGORY_LABELS, categoryLabel } from "@/lib/format";
import { cn } from "@/lib/utils";
import { CampaignCard } from "./CampaignCard";
import { discoveryApi } from "./discovery.api";
import type { Campaign, Pagination, Sort } from "./discovery.types";

const PAGE_SIZE = 12;
const control = "h-9 rounded-md border border-line bg-surface px-3 text-sm hover:border-ink-soft/40";

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
    <div className="space-y-5">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative w-full sm:w-80">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-soft" />
          <input
            type="search"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search products"
            aria-label="Search products"
            className={cn(control, "w-full pl-9")}
          />
        </div>
        <select
          aria-label="Sort campaigns"
          value={sort}
          onChange={(e) => { setSort(e.target.value as Sort); setPage(1); }}
          className={cn(control, "sm:ml-auto")}
        >
          <option value="recent">Newest first</option>
          <option value="ending_soon">Ending soon</option>
        </select>
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
              onClick={() => { setCategory(c); setPage(1); }}
              className={cn(
                "shrink-0 rounded-full border px-3.5 py-1 text-sm transition-colors",
                selected
                  ? "border-brand bg-brand-tint font-medium text-brand-dark"
                  : "border-line bg-surface text-ink-soft hover:bg-canvas"
              )}
            >
              {c ? categoryLabel(c) : "All"}
            </button>
          );
        })}
      </div>

      {/* Results */}
      {loadError ? (
        <div className="rounded-lg border border-line bg-surface">
          <EmptyState
            icon={AlertCircle}
            title="Couldn't load campaigns"
            description={loadError}
            action={<Button variant="secondary" onClick={load}>Try again</Button>}
          />
        </div>
      ) : firstLoad ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="overflow-hidden rounded-lg border border-line bg-surface">
              <Skeleton className="aspect-[4/3] w-full rounded-none" />
              <div className="space-y-2 p-4">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-3 w-28" />
                <Skeleton className="h-3 w-full" />
              </div>
            </div>
          ))}
        </div>
      ) : campaigns.length === 0 ? (
        <div className="rounded-lg border border-line bg-surface">
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
        <div className={cn("grid gap-5 transition-opacity sm:grid-cols-2 lg:grid-cols-3", fetching && "opacity-60")}>
          {campaigns.map((c) => (
            <CampaignCard key={c.id} campaign={c} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.total > 0 && !loadError && (
        <div className="flex items-center justify-between text-sm text-ink-soft">
          <span>
            Showing {from}–{to} of {pagination.total}
          </span>
          <div className="flex gap-2">
            <Button variant="secondary" className="h-8 px-3" disabled={page <= 1 || fetching} onClick={() => setPage((p) => p - 1)}>
              Previous
            </Button>
            <Button
              variant="secondary"
              className="h-8 px-3"
              disabled={page >= pagination.totalPages || fetching}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}