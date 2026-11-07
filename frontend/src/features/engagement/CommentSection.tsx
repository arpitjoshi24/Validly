"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { formatDate } from "@/lib/format";
import { engagementApi } from "./engagement.api";
import type { Comment, CommentPage } from "./engagement.types";

type Props = { campaignId: string; canPost: boolean };

export function CommentSection({ campaignId, canPost }: Props) {
  const { user } = useAuth();
  const [items, setItems] = useState<Comment[]>([]);
  const [pagination, setPagination] = useState<CommentPage["pagination"] | null>(null);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState("");
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // The list endpoint does not say who wrote a comment, so we remember ones posted in this session.
  const [mineIds, setMineIds] = useState<Set<string>>(new Set());

  const load = useCallback(
    async (page: number) => {
      try {
        const data = await engagementApi.listComments(campaignId, page);
        setItems((prev) => (page === 1 ? data.items : [...prev, ...data.items]));
        setPagination(data.pagination);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Could not load comments.");
      } finally {
        setLoading(false);
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
    if (content.length > 500) return setError("Comments can be at most 500 characters.");

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
    if (!confirm("Delete your comment?")) return;
    setError(null);
    try {
      await engagementApi.deleteComment(campaignId, id);
      setItems((prev) => prev.filter((c) => c.id !== id));
      setPagination((p) => (p ? { ...p, total: Math.max(0, p.total - 1) } : p));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not delete the comment. Try again.");
    }
  }

  const isMine = (c: Comment) => mineIds.has(c.id) || (!!c.userId && c.userId === user?.id);

  return (
    <div>
      <h3 className="font-semibold">Comments{pagination ? ` (${pagination.total})` : ""}</h3>

      {canPost && (
        <form onSubmit={handlePost} className="mt-3">
          <label htmlFor="comment" className="sr-only">Add a comment</label>
          <textarea id="comment" rows={3} value={text} maxLength={500} onChange={(e) => setText(e.target.value)}
            placeholder="What do you think? Tell the founder what you'd change."
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand" />
          <div className="mt-1 flex items-center justify-between">
            <span className="text-xs text-ink-soft">{text.trim().length} / 500</span>
            <button type="submit" disabled={posting}
              className="rounded-md bg-brand px-4 py-1.5 text-sm font-medium text-white hover:bg-brand-dark disabled:opacity-60">
              {posting ? "Posting..." : "Post comment"}
            </button>
          </div>
        </form>
      )}

      {error && <p role="alert" className="mt-2 text-sm text-red-600">{error}</p>}
      {loading && <p className="mt-3 text-sm text-ink-soft">Loading comments...</p>}
      {!loading && items.length === 0 && (
        <p className="mt-3 text-sm text-ink-soft">No comments yet. Be the first to share feedback.</p>
      )}

      <ul className="mt-4 space-y-3">
        {items.map((c) => (
          <li key={c.id} className="rounded-md border border-gray-100 p-3">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-medium">{c.user.name}</p>
             <p className="text-xs text-ink-soft">{formatDate(c.createdAt)}</p>
            </div>
            <p className="mt-1 whitespace-pre-line text-sm">{c.content}</p>
            {isMine(c) && (
              <button type="button" onClick={() => handleDelete(c.id)} className="mt-2 text-xs text-red-600 hover:underline">
                Delete
              </button>
            )}
          </li>
        ))}
      </ul>

      {pagination && pagination.page < pagination.totalPages && (
        <button type="button" onClick={() => load(pagination.page + 1)}
          className="mt-4 rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium hover:bg-gray-50">
          Load more comments
        </button>
      )}
    </div>
  );
}