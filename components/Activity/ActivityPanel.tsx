"use client";

import { useCallback, useEffect, useState } from "react";
import { CornerDownRight, Loader2, Send, Trash2 } from "lucide-react";
import type { ClickUpComment, ClickUpTask, ClickUpUser } from "@/lib/types";
import { avatarTone, cx, displayName, formatDateTime, initials, timeAgo } from "@/lib/ui";
import { linkify } from "@/lib/linkify";

/**
 * A API v2 do ClickUp expõe os COMENTÁRIOS, mas não o log de atividades
 * (quem moveu de onde para onde). Por isso o histórico aqui é o que a API
 * entrega de fato: criação, última atualização e a conversa do card.
 */
export function ActivityPanel({ task }: { task: ClickUpTask }) {
  const [comments, setComments] = useState<ClickUpComment[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyDraft, setReplyDraft] = useState("");
  const [replies, setReplies] = useState<Record<string, ClickUpComment[]>>({});
  const [me, setMe] = useState<ClickUpUser | null>(null);

  // P13: o botão de excluir só aparece no comentário de quem está usando.
  // Antes aparecia em todos e só falhava depois do clique.
  useEffect(() => {
    let cancelled = false;
    fetch("/api/me")
      .then(async (response) => {
        const data = (await response.json()) as { user?: ClickUpUser };
        if (!cancelled && data.user) setMe(data.user);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, []);

  const load = useCallback(async () => {
    setError(null);
    try {
      const response = await fetch(`/api/task/${task.id}/comments`);
      const data = (await response.json()) as { comments?: ClickUpComment[]; error?: string };
      if (!response.ok) throw new Error(data.error ?? "Falha ao carregar comentários.");
      setComments(data.comments ?? []);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Erro desconhecido.");
      setComments([]);
    }
  }, [task.id]);

  useEffect(() => {
    setComments(null);
    setReplies({});
    setReplyTo(null);
    void load();
  }, [load]);

  async function send() {
    const text = draft.trim();
    if (!text || sending) return;
    setSending(true);
    setError(null);
    try {
      const response = await fetch(`/api/task/${task.id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      const data = (await response.json()) as { comments?: ClickUpComment[]; error?: string };
      if (!response.ok) throw new Error(data.error ?? "Falha ao enviar o comentário.");
      setComments(data.comments ?? []);
      setDraft("");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Erro desconhecido.");
    } finally {
      setSending(false);
    }
  }

  async function removeComment(commentId: string) {
    setBusyId(commentId);
    setError(null);
    try {
      const response = await fetch(`/api/comment/${commentId}`, { method: "DELETE" });
      if (!response.ok) {
        const data = (await response.json()) as { error?: string };
        throw new Error(data.error ?? "Falha ao excluir o comentário.");
      }
      await load();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Erro desconhecido.");
    } finally {
      setBusyId(null);
    }
  }

  async function loadReplies(commentId: string) {
    try {
      const response = await fetch(`/api/comment/${commentId}`);
      const data = (await response.json()) as { replies?: ClickUpComment[]; error?: string };
      if (!response.ok) throw new Error(data.error ?? "Falha ao carregar respostas.");
      setReplies((current) => ({ ...current, [commentId]: data.replies ?? [] }));
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Erro desconhecido.");
    }
  }

  async function sendReply(commentId: string) {
    const text = replyDraft.trim();
    if (!text) return;
    setBusyId(commentId);
    try {
      const response = await fetch(`/api/comment/${commentId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      const data = (await response.json()) as { replies?: ClickUpComment[]; error?: string };
      if (!response.ok) throw new Error(data.error ?? "Falha ao responder.");
      setReplies((current) => ({ ...current, [commentId]: data.replies ?? [] }));
      setReplyDraft("");
      setReplyTo(null);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Erro desconhecido.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-baseline gap-2">
        <h3 className="hub-table-header">Atividade</h3>
        {comments && (
          <span className="hub-number text-[11px] text-muted-foreground">
            {comments.length} comentário(s)
          </span>
        )}
      </div>

      <div className="space-y-1">
        <p className="hub-meta">Criada em {formatDateTime(task.date_created)}</p>
        <p className="hub-meta">Atualizada em {formatDateTime(task.date_updated)}</p>
      </div>

      {error && (
        <p className="text-[13px] text-error leading-relaxed" role="alert">
          {error}
        </p>
      )}

      <div className="space-y-2.5">
        {comments === null &&
          Array.from({ length: 2 }).map((_, index) => (
            <div key={index} className="h-20 rounded-xl bg-white/[0.03] animate-pulse" />
          ))}

        {comments?.length === 0 && (
          <p className="hub-meta leading-relaxed">
            Nenhum comentário ainda. O que você escrever aqui vai para o card no ClickUp.
          </p>
        )}

        {comments?.map((comment) => {
          const commentReplies = replies[comment.id];
          const replyCount = comment.reply_count ?? 0;

          return (
            <article
              key={comment.id}
              className="rounded-xl border border-border bg-card p-3 space-y-2.5"
            >
              <header className="flex items-center gap-2">
                <span
                  className="size-6 rounded-full grid place-items-center text-[10px] shrink-0"
                  style={{ backgroundColor: avatarTone(comment.user ? displayName(comment.user) : "?") }}
                >
                  {initials(comment.user ? displayName(comment.user) : "?")}
                </span>
                <span className="text-[13px] font-medium truncate">
                  {comment.user ? displayName(comment.user) : "Desconhecido"}
                </span>
                <span className="hub-meta">{timeAgo(new Date(Number(comment.date)))}</span>

                {me && comment.user?.id === me.id && (
                  <button
                    type="button"
                    onClick={() => void removeComment(comment.id)}
                    disabled={busyId === comment.id}
                    aria-label="Excluir comentário"
                    className="ml-auto text-muted-foreground hover:text-error transition-colors disabled:opacity-50"
                  >
                    {busyId === comment.id ? (
                      <Loader2 className="size-3.5 animate-spin" aria-hidden />
                    ) : (
                      <Trash2 className="size-3.5" aria-hidden />
                    )}
                  </button>
                )}
              </header>

              <p className="text-[13px] leading-relaxed text-foreground/85 whitespace-pre-wrap break-words min-w-0">
                {linkify(comment.comment_text)}
              </p>

              {commentReplies?.map((reply) => (
                <div key={reply.id} className="flex gap-2 pl-3 border-l border-border">
                  <CornerDownRight
                    className="size-3.5 text-muted-foreground shrink-0 mt-0.5"
                    aria-hidden
                  />
                  <div className="min-w-0">
                    <p className="hub-meta">
                      {reply.user ? displayName(reply.user) : "Desconhecido"} ·{" "}
                      {timeAgo(new Date(Number(reply.date)))}
                    </p>
                    <p className="text-[13px] leading-relaxed text-foreground/85 whitespace-pre-wrap break-words min-w-0">
                      {linkify(reply.comment_text)}
                    </p>
                  </div>
                </div>
              ))}

              <div className="flex items-center gap-3">
                {replyCount > 0 && !commentReplies && (
                  <button
                    type="button"
                    onClick={() => void loadReplies(comment.id)}
                    className="hub-meta text-interactive hover:opacity-80"
                  >
                    Mostrar {replyCount} resposta(s)
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setReplyTo(replyTo === comment.id ? null : comment.id);
                    setReplyDraft("");
                  }}
                  className="hub-meta text-interactive hover:opacity-80 ml-auto"
                >
                  Responder
                </button>
              </div>

              {replyTo === comment.id && (
                <div className="flex items-end gap-2">
                  <textarea
                    autoFocus
                    rows={2}
                    value={replyDraft}
                    onChange={(event) => setReplyDraft(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" && !event.shiftKey) {
                        event.preventDefault();
                        void sendReply(comment.id);
                      }
                    }}
                    placeholder="Escreva uma resposta"
                    aria-label="Resposta ao comentário"
                    className="hub-input flex-1 resize-none !py-2"
                  />
                  <button
                    type="button"
                    onClick={() => void sendReply(comment.id)}
                    disabled={busyId === comment.id || replyDraft.trim().length === 0}
                    aria-label="Enviar resposta"
                    className="hub-botao-primario !px-2.5 !py-2 disabled:opacity-50"
                  >
                    <Send className="size-4" aria-hidden />
                  </button>
                </div>
              )}
            </article>
          );
        })}
      </div>

      <div className="rounded-xl border border-border bg-card p-2.5 space-y-2">
        <textarea
          rows={2}
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              void send();
            }
          }}
          placeholder="Escreva um comentário"
          aria-label="Novo comentário"
          className="w-full bg-transparent text-[13px] resize-none focus:outline-none placeholder:text-muted-foreground"
        />
        <div className="flex items-center justify-between">
          <span className="hub-meta">Enter envia · Shift+Enter quebra linha</span>
          <button
            type="button"
            onClick={() => void send()}
            disabled={sending || draft.trim().length === 0}
            aria-label="Enviar comentário"
            className={cx("hub-botao-primario !px-3 !py-1.5 disabled:opacity-50")}
          >
            {sending ? (
              <Loader2 className="size-4 animate-spin" aria-hidden />
            ) : (
              <Send className="size-4" aria-hidden />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
