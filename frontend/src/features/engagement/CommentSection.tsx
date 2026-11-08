"use client";

import { useCallback, useEffect, useState } from "react";
import { AlertCircle, MessageSquare } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { useAuth } from "@/hooks/useAuth";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import { engagementApi } from "./engagement.api";
import type { Comment, CommentPage } from "./engagement.types";

type Props = { campaignId: string; canPost: boolean };

const MAX = 500;

export function CommentSection({ campaignId, canPost }: Props) {
  const { user } = useAuth();
  const [items, setItems] = useState<Comment[]>([]);
  const [pagination, setPagination] = useState<CommentPage["pagination"] | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [text, setText] = useState("");
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  // The list endpoint does not say who wrote a comment, so we remember ones posted in this session.
  const [mineIds, setMineIds] = useState<Set<string>>(new Set());

  const load = useCallback(
    async (page: number) => {
      if (page > 1) setLoadingMore(true);
      try {
        const data = await engagementApi.listComments(campaignId, page);
        setItems((prev) => (page === 1 ? data.items : [...prev, ...data.items]));
        setPagination(data.pagination);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Could not load comments.");
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [campaignId]
  );

  useEffect(() => {
    load(1);
  }, [load]);

  async function handlePost(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const content = text.trim();
    if (content.length < 3) return setError("Write at least 3 characters.");
    if (content.length > MAX) return setError(`Comments can be at most ${MAX} characters.`);

    setPosting(true);
    try {
      const comment = await engagementApi.createComment(campaignId, content);
      setItems((prev) => [comment, ...prev]);
      setMineIds((prev) => new Set(prev).add(comment.id));
      setPagination((p) => (p ? { ...p, total: p.total + 1 } : p));
      setText("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not post your comment. Try again.");
    } finally {
      setPosting(false);
    }
  }

  async function handleDelete(id: string) {
    setError(null);
    try {
      await engagementApi.deleteComment(campaignId, id);
      setItems((prev) => prev.filter((c) => c.id !== id));
      setPagination((p) => (p ? { ...p, total: Math.max(0, p.total - 1) } : p));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not delete the comment. Try again.");
    } finally {
      setConfirmId(null);
    }
  }

  const isMine = (c: Comment) => mineIds.has(c.id) || (!!c.userId && c.userId === user?.id);
  const length = text.trim().length;

  return (
    <div>
      <div className="flex items-start gap-4">
        <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-brand-tint text-brand">
          <MessageSquare className="size-5" />
        </span>
        <div>
          <h2 className="text-lg font-semibold">
            Comments
            {pagination && (
              <span className="ml-2 rounded-full bg-canvas px-2.5 py-0.5 align-middle text-sm font-medium tabular-nums text-ink-soft">
                {pagination.total}
              </span>
            )}
          </h2>
          <p className="mt-1 text-sm text-ink-soft">Tell the founder what you like and what you&apos;d change.</p>
        </div>
      </div>

      {canPost && (
        <form onSubmit={handlePost} className="mt-5">
          <label htmlFor="comment" className="sr-only">
            Add a comment
          </label>
          <textarea
            id="comment"
            rows={3}
            value={text}
            maxLength={MAX}
            onChange={(e) => setText(e.target.value)}
            placeholder="What do you think? Tell the founder what you'd change."
            className="w-full resize-y rounded-xl border border-line bg-surface px-4 py-3 text-sm leading-relaxed outline-none transition hover:border-ink-soft/40 focus:border-brand focus:ring-4 focus:ring-brand/10"
          />
          <div className="mt-2 flex items-center justify-between gap-3">
            <span className={cn("text-xs tabular-nums", length > MAX - 50 ? "text-signal" : "text-ink-soft")}>
              {length} / {MAX}
            </span>
            <Button type="submit" loading={posting} disabled={length < 3} className="h-10">
              {posting ? "Posting..." : "Post comment"}
            </Button>
          </div>
        </form>
      )}

      {error && (
        <p role="alert" className="mt-3 flex items-start gap-2 rounded-xl bg-danger-tint px-4 py-3 text-sm text-danger">
          <AlertCircle className="mt-0.5 size-4 shrink-0" /> {error}
        </p>
      )}

      {loading ? (
        <ul className="mt-6 space-y-5">
          {Array.from({ length: 2 }).map((_, i) => (
            <li key={i} className="flex gap-3">
              <Skeleton className="size-9 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-3.5 w-32" />
                <Skeleton className="h-3.5 w-full" />
              </div>
            </li>
          ))}
        </ul>
      ) : items.length === 0 ? (
        <div className="mt-6 rounded-xl border border-dashed border-line bg-canvas/60 px-6 py-8 text-center">
          <p className="font-medium">No comments yet</p>
          <p className="mt-1 text-sm text-ink-soft">Be the first to share feedback with the founder.</p>
        </div>
      ) : (
        <ul className="mt-6 divide-y divide-line">
          {items.map((c) => (
            <li key={c.id} className="flex gap-3 py-4 first:pt-0 last:pb-0">
              <Avatar name={c.user.name} size="sm" />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-x-2.5 gap-y-0.5">
                  <p className="text-sm font-semibold">{c.user.name}</p>
                  {isMine(c) && (
                    <span className="rounded-full bg-brand-tint px-2 py-0.5 text-xs font-medium text-brand-dark">You</span>
                  )}
                  <p className="text-xs text-ink-soft">{formatDate(c.createdAt)}</p>
                </div>
                <p className="mt-1 whitespace-pre-line break-words text-sm leading-relaxed">{c.content}</p>

                {isMine(c) &&
                  (confirmId === c.id ? (
                    <p className="mt-2 flex items-center gap-3 text-xs">
                      <span className="text-ink-soft">Delete this comment?</span>
                      <button type="button" onClick={() => handleDelete(c.id)} className="font-semibold text-danger hover:underline">
                        Yes, delete
                      </button>
                      <button type="button" onClick={() => setConfirmId(null)} className="font-medium text-ink-soft hover:underline">
                        Cancel
                      </button>
                    </p>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setConfirmId(c.id)}
                      className="mt-2 text-xs font-medium text-ink-soft hover:text-danger hover:underline"
                    >
                      Delete
                    </button>
                  ))}
              </div>
            </li>
          ))}
        </ul>
      )}

      {pagination && pagination.page < pagination.totalPages && (
        <Button variant="secondary" className="mt-5 h-10" loading={loadingMore} onClick={() => load(pagination.page + 1)}>
          Load more comments
        </Button>
      )}
    </div>
  );
}