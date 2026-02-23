"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

/* ─────────────────── BUCKET COLORS (no purple) ─────────────────── */
const BUCKET_PALETTE = [
  { from: "#f97316", to: "#fb923c" },
  { from: "#3b82f6", to: "#60a5fa" },
  { from: "#10b981", to: "#34d399" },
  { from: "#ec4899", to: "#f472b6" },
  { from: "#f59e0b", to: "#fbbf24" },
  { from: "#06b6d4", to: "#22d3ee" },
  { from: "#ef4444", to: "#f87171" },
  { from: "#84cc16", to: "#a3e635" },
];

function hashBucket(name) {
  let h = 0;
  for (let i = 0; i < name.length; i++)
    h = (h * 31 + name.charCodeAt(i)) % BUCKET_PALETTE.length;
  return BUCKET_PALETTE[h];
}

function truncateWords(text, maxWords) {
  if (!text) return "";
  const words = text.trim().split(/\s+/);
  if (words.length <= maxWords) return text;
  return words.slice(0, maxWords).join(" ");
}

/* ─────────────────── SYNTAX HIGHLIGHT ─────────────────── */
const TOKEN_PATTERNS = [
  { re: /(\/\/[^\n]*|\/\*[\s\S]*?\*\/|#[^\n]*)/g, color: "#6a9955" },
  {
    re: /("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`)/g,
    color: "#ce9178",
  },
  {
    re: /\b(const|let|var|function|return|if|else|for|while|class|import|export|default|async|await|try|catch|throw|new|typeof|instanceof|from|of|in|true|false|null|undefined|void)\b/g,
    color: "#569cd6",
  },
  { re: /\b(\d+\.?\d*)\b/g, color: "#b5cea8" },
  {
    re: /\b(console|Math|Array|Object|String|Promise|fetch|JSON|Date|window|document|process)\b/g,
    color: "#4ec9b0",
  },
];

function syntaxHighlight(code) {
  const segments = [];
  let remaining = code;
  while (remaining.length > 0) {
    let earliest = null,
      earliestIdx = Infinity,
      earliestColor = "";
    for (const p of TOKEN_PATTERNS) {
      p.re.lastIndex = 0;
      const m = p.re.exec(remaining);
      if (m && m.index < earliestIdx) {
        earliest = m;
        earliestIdx = m.index;
        earliestColor = p.color;
      }
    }
    if (!earliest) {
      segments.push({ text: remaining, color: null });
      break;
    }
    if (earliestIdx > 0)
      segments.push({ text: remaining.slice(0, earliestIdx), color: null });
    segments.push({ text: earliest[0], color: earliestColor });
    remaining = remaining.slice(earliestIdx + earliest[0].length);
  }
  return segments;
}

/* ─────────────────── CODE BLOCK ─────────────────── */
function CodeBlock({ code, language }) {
  const [copied, setCopied] = useState(false);
  const segments = syntaxHighlight(code);

  return (
    <div
      className="relative rounded-xl overflow-hidden"
      style={{
        background: "#0d1117",
        border: "1px solid rgba(255,255,255,0.07)",
        boxShadow:
          "0 2px 16px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.03)",
      }}
    >
      <div
        className="flex items-center justify-between px-3 py-2 shrink-0"
        style={{
          background: "rgba(255,255,255,0.025)",
          borderBottom: "1px solid rgba(255,255,255,0.05)",
        }}
      >
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
          {language && (
            <span
              className="ml-2 text-[10px] font-bold tracking-widest uppercase px-2 py-0.5 rounded"
              style={{ background: "rgba(14,165,233,0.12)", color: "#38bdf8" }}
            >
              {language}
            </span>
          )}
        </div>
        <button
          onClick={() =>
            navigator.clipboard.writeText(code).then(() => {
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
            })
          }
          className="flex items-center gap-1 text-[10px] font-semibold px-2.5 py-0.5 rounded-md transition-all"
          style={{
            background: copied
              ? "rgba(52,211,153,0.12)"
              : "rgba(255,255,255,0.05)",
            color: copied ? "#34d399" : "#6b7280",
            border: `1px solid ${copied ? "rgba(52,211,153,0.25)" : "rgba(255,255,255,0.07)"}`,
          }}
        >
          {copied ? "✓ Copied" : "Copy"}
        </button>
      </div>
      <pre
        className="overflow-auto p-3 text-[11.5px] font-mono leading-[1.7]"
        style={{
          fontFamily: "'JetBrains Mono','Fira Code','Cascadia Code',monospace",
          maxHeight: "550px",
        }}
      >
        <code>
          {segments.map((seg, i) => (
            <span key={i} style={{ color: seg.color || "#cdd6f4" }}>
              {seg.text}
            </span>
          ))}
        </code>
      </pre>
    </div>
  );
}

function CodeSection({ codeBlocks, questionId }) {
  const [activeIdx, setActiveIdx] = useState(0);
  if (!codeBlocks?.length) return null;

  return (
    <div className="mt-3 flex flex-col">
      {codeBlocks.length > 1 && (
        <div
          className="flex gap-1.5 mb-2 overflow-x-auto pb-1 shrink-0"
          style={{ scrollbarWidth: "none" }}
        >
          {codeBlocks.map((b, i) => (
            <button
              key={i}
              onClick={(e) => {
                e.stopPropagation();
                setActiveIdx(i);
              }}
              className="shrink-0 px-2.5 py-0.5 rounded-md text-[10px] font-bold transition-all"
              style={{
                background:
                  i === activeIdx
                    ? "rgba(14,165,233,0.18)"
                    : "rgba(255,255,255,0.04)",
                color: i === activeIdx ? "#38bdf8" : "#4b5563",
                border: `1px solid ${i === activeIdx ? "rgba(14,165,233,0.3)" : "rgba(255,255,255,0.06)"}`,
              }}
            >
              {b.language || `File ${i + 1}`}
            </button>
          ))}
        </div>
      )}
      <CodeBlock
        key={questionId}
        code={codeBlocks[activeIdx].code}
        language={codeBlocks[activeIdx].language}
      />
    </div>
  );
}

/* ─────────────────── LIGHTBOX ─────────────────── */
function ImageLightbox({ src, onClose }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: "rgba(0,0,0,0.93)", backdropFilter: "blur(12px)" }}
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 w-9 h-9 flex items-center justify-center rounded-full text-white text-sm"
        style={{
          background: "rgba(255,255,255,0.1)",
          border: "1px solid rgba(255,255,255,0.15)",
        }}
      >
        ✕
      </button>
      <motion.img
        initial={{ scale: 0.92 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.92 }}
        src={src}
        alt="Zoomed"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: "92vw",
          maxHeight: "92vh",
          objectFit: "contain",
          borderRadius: 12,
        }}
      />
    </motion.div>
  );
}

/* ─────────────────── HEART BUTTON ─────────────────── */
function HeartButton({ count, onLike }) {
  const [liked, setLiked] = useState(false);
  const [animating, setAnimating] = useState(false);
  const [localCount, setLocalCount] = useState(count);

  const handleClick = (e) => {
    e.stopPropagation();
    if (animating) return;
    setAnimating(true);
    const wasLiked = liked;
    setLiked(!wasLiked);
    setLocalCount((c) => (wasLiked ? c - 1 : c + 1));
    if (!wasLiked) onLike?.();
    setTimeout(() => setAnimating(false), 400);
  };

  return (
    <button
      onClick={handleClick}
      className="flex items-center gap-1.5 shrink-0"
      style={{ WebkitTapHighlightColor: "transparent" }}
    >
      <motion.span
        animate={animating ? { scale: [1, 1.5, 0.9, 1.1, 1] } : {}}
        transition={{ duration: 0.38 }}
        style={{
          display: "inline-block",
          fontSize: 18,
          filter: liked ? "drop-shadow(0 0 5px rgba(239,68,68,0.55))" : "none",
        }}
      >
        {liked ? "❤️" : "🤍"}
      </motion.span>
      <span
        className="text-sm font-bold tabular-nums"
        style={{ color: liked ? "#f87171" : "#4b5563" }}
      >
        {localCount}
      </span>
    </button>
  );
}

/* ─────────────────── CARD CONTENT ─────────────────── */
function CardContent({ question, onImageClick, onLike }) {
  console.log(question);
  const palette = hashBucket(question.bucketName);
  const codeBlocks = Array.isArray(question.codeJson) ? question.codeJson : [];
  const [expanded, setExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState("question");
  const text = question.text || "";
  const words = text.trim().split(/\s+/);
  const isLong = words.length > 50;

  const hasCode = codeBlocks.length > 0;

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* ── Header: bucket pill + question name + buttons ── */}
      <div className="shrink-0 flex items-center justify-between px-4 pt-3 pb-2 gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <span
            className="inline-block text-[9px] font-black tracking-[0.14em] uppercase px-2 py-0.5 rounded-md shrink-0"
            style={{
              background: `${palette.from}1a`,
              color: palette.from,
              border: `1px solid ${palette.from}30`,
            }}
          >
            {question.bucketName}
          </span>
          {question.name && (
            <p
              className="text-[15px] font-black text-[#f0f0f8] leading-snug truncate"
              style={{ letterSpacing: "-0.015em" }}
              title={question.name}
            >
              {question.name}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <HeartButton count={question.reviewCount} onLike={onLike} />
        </div>
      </div>

      {/* ── Tabs ── */}
      {hasCode && (
        <div className="shrink-0 flex gap-1 px-4 pb-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setActiveTab("question");
            }}
            className="flex-1 py-1.5 text-[11px] font-bold rounded-lg transition-colors"
            style={{
              background:
                activeTab === "question"
                  ? "rgba(14,165,233,0.18)"
                  : "rgba(255,255,255,0.04)",
              color: activeTab === "question" ? "#38bdf8" : "#6b7280",
              border: `1px solid ${activeTab === "question" ? "rgba(14,165,233,0.3)" : "rgba(255,255,255,0.06)"}`,
            }}
          >
            Question
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setActiveTab("code");
            }}
            className="flex-1 py-1.5 text-[11px] font-bold rounded-lg transition-colors"
            style={{
              background:
                activeTab === "code"
                  ? "rgba(14,165,233,0.18)"
                  : "rgba(255,255,255,0.04)",
              color: activeTab === "code" ? "#38bdf8" : "#6b7280",
              border: `1px solid ${activeTab === "code" ? "rgba(14,165,233,0.3)" : "rgba(255,255,255,0.06)"}`,
            }}
          >
            Code
          </button>
        </div>
      )}

      {/* ── Content based on tab ── */}
      <div
        className="flex-1 overflow-y-auto min-h-0 px-4 pb-4"
        style={{ scrollbarWidth: "none" }}
      >
        {activeTab === "question" ? (
          <>
            {/* IMAGE */}
            {question.imageUrl && (
              <div className="mb-3">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onImageClick?.(question.imageUrl);
                  }}
                  className="relative w-full rounded-xl overflow-hidden block"
                  style={{
                    aspectRatio: "16/9",
                    border: "1px solid rgba(255,255,255,0.06)",
                  }}
                >
                  <Image
                    src={question.imageUrl}
                    alt="Question"
                    fill
                    unoptimized
                    className="object-cover"
                  />
                  <div
                    className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
                    style={{ background: "rgba(0,0,0,0.4)" }}
                  >
                    <span className="text-white text-xl">🔍</span>
                  </div>
                </button>
              </div>
            )}

            {/* INTUITION */}
            {question.text && (
              <div>
                <div className="flex items-center gap-1.5 mb-1.5">
                  <div
                    className="w-0.5 h-3 rounded-full"
                    style={{
                      background: `linear-gradient(to bottom, ${palette.from}, ${palette.to})`,
                    }}
                  />
                  <span
                    className="text-[9px] font-black tracking-[0.14em] uppercase"
                    style={{ color: palette.from }}
                  >
                    Intuition
                  </span>
                </div>
                <p className="text-[13px] leading-[1.72] text-[#b8bcc8] whitespace-pre-wrap">
                  {expanded ? text : truncateWords(text, 50)}
                </p>
                {isLong && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setExpanded(!expanded);
                    }}
                    className="text-[11px] font-bold mt-1"
                    style={{ color: palette.from }}
                  >
                    {expanded ? "Show less" : "Read more"}
                  </button>
                )}
              </div>
            )}
          </>
        ) : (
          /* CODE TAB */
          codeBlocks.length > 0 && (
            <CodeSection questionId={question.id} codeBlocks={codeBlocks} />
          )
        )}
      </div>
    </div>
  );
}

/* ─────────────────── MAIN PAGE ─────────────────── */
const cardStyle = {
  background:
    "linear-gradient(160deg, rgba(18,20,28,0.97) 0%, rgba(12,14,20,0.99) 100%)",
  backdropFilter: "blur(24px)",
  WebkitBackdropFilter: "blur(24px)",
  border: "1px solid rgba(255,255,255,0.07)",
  boxShadow:
    "0 16px 60px rgba(0,0,0,0.65), inset 0 1px 0 rgba(255,255,255,0.05)",
};

export default function QuestionReviewPage() {
  const [questions, setQuestions] = useState([]);
  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [activeBucket, setActiveBucket] = useState("TODAY");
  const [exiting, setExiting] = useState(null);
  const [zoomedImage, setZoomedImage] = useState(null);
  const [total, setTotal] = useState(0);
  const [pagination, setPagination] = useState({ skip: 0, take: 10 });
  const [todayCompleted, setTodayCompletedState] = useState(false);
  const [buckets, setBuckets] = useState([]);
  const getTodayKey = () => {
    const today = new Date().toISOString().split("T")[0];
    return `today-questions-${today}`;
  };

  const isTodayCompleted = useCallback(() => {
    if (typeof window === "undefined") return false;
    const key = getTodayKey();
    const completed = localStorage.getItem(key);
    return completed === "true";
  }, []);

  const setTodayCompleted = useCallback((completed) => {
    if (typeof window === "undefined") return;
    const key = getTodayKey();
    localStorage.setItem(key, completed.toString());
    setTodayCompletedState(completed);
  }, []);

  const fetchQuestions = useCallback(
    async (bucket, append = false) => {
      setLoading(true);
      try {
        const isToday = bucket === "TODAY";
        const take = isToday ? 5 : pagination.take;
        const skip = isToday ? 0 : append ? questions.length : 0;

        let url = `/api/question-review?take=${take}&skip=${skip}`;
        if (bucket && bucket !== "TODAY") {
          url += `&bucket=${encodeURIComponent(bucket)}`;
        }

        const res = await fetch(url);
        const data = await res.json();

        if (append) {
          setQuestions((prev) => [...prev, ...data.questions]);
        } else {
          setQuestions(data.questions);
          setIndex(0);
        }
        setTotal(data.total);
        setPagination({ take, skip });

        if (isToday) {
          setTodayCompleted(false);
        }
      } catch (e) {
        console.error("Failed to fetch questions", e);
      } finally {
        setLoading(false);
      }
    },
    [pagination.take, questions.length],
  );

  useEffect(() => {
    fetch("/api/question-review/buckets")
      .then((res) => res.json())
      .then((data) => setBuckets(data))
      .catch((e) => console.error("Failed to fetch buckets", e));
  }, []);

  useEffect(() => {
    fetchQuestions(activeBucket);
  }, [activeBucket, fetchQuestions]);

  useEffect(() => {
    if (activeBucket === "TODAY") {
      const completed = isTodayCompleted();
      setTodayCompletedState(completed);
    }
  }, [activeBucket, isTodayCompleted]);

  // LEFT swipe = Got it (mark reviewed)
  const handleSwipeLeft = useCallback(() => {
    if (exiting) return;
    if (navigator.vibrate) navigator.vibrate(10);
    setExiting("left");
    const current = questions[index];
    if (current) {
      setQuestions((prev) =>
        prev.map((q) =>
          q.id === current.id ? { ...q, reviewCount: q.reviewCount + 1 } : q,
        ),
      );
      fetch(`/api/question-review/${current.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "increment" }),
      }).catch(() => {});
    }
  }, [exiting, questions, index]);

  // RIGHT swipe = Skip
  const handleSwipeRight = useCallback(() => {
    if (exiting) return;
    if (navigator.vibrate) navigator.vibrate([10, 10, 10]);
    setExiting("right");
  }, [exiting]);

  const handleLike = useCallback(() => {
    const current = questions[index];
    if (!current) return;
    fetch(`/api/question-review/${current.id}`, { method: "PATCH" }).catch(
      () => {},
    );
  }, [questions, index]);

  const handleAnimationComplete = useCallback(() => {
    if (exiting) {
      const isToday = activeBucket === "TODAY";
      const reviewedAll = index + 1 >= questions.length;

      if (isToday && reviewedAll) {
        setTodayCompleted(true);
      }

      if (reviewedAll && !loading && total > questions.length) {
        fetchQuestions(activeBucket, true);
      }

      setIndex((i) => i + 1);
      setExiting(null);
    }
  }, [exiting, index, questions.length, activeBucket, loading, total, fetchQuestions, setTodayCompleted]);

  const current = questions[index];
  const next = questions[index + 1];
  const isDone = !loading && index >= questions.length && questions.length > 0;
  const isEmpty = !loading && questions.length === 0;
  const todayDone = activeBucket === "TODAY" && todayCompleted;

  return (
    <div
      className="fixed inset-0 flex flex-col"
      style={{
        background: "#080a10",
        fontFamily: "'DM Sans','Geist',sans-serif",
      }}
    >
      <AnimatePresence>
        {zoomedImage && (
          <ImageLightbox
            src={zoomedImage}
            onClose={() => setZoomedImage(null)}
          />
        )}
      </AnimatePresence>

      {/* ── COMPACT HEADER ── */}
      <div
        className="shrink-0 flex items-center gap-2 px-3 pt-3 pb-2"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}
      >
        <div
          className="flex gap-1.5 overflow-x-auto flex-1"
          style={{ scrollbarWidth: "none" }}
        >
          {["TODAY", ...buckets].map((bucket) => {
            const pal = bucket !== "TODAY" ? hashBucket(bucket) : null;
            const isActive = activeBucket === bucket;
            const isToday = bucket === "TODAY";
            return (
              <button
                key={bucket}
                onClick={() => setActiveBucket(bucket)}
                className="shrink-0 px-3 py-1 rounded-lg text-[11px] font-bold transition-all"
                style={
                  isActive
                    ? {
                        background: isToday
                          ? "linear-gradient(135deg, #f59e0b, #fbbf24)"
                          : pal
                            ? `linear-gradient(135deg, ${pal.from}, ${pal.to})`
                            : "linear-gradient(135deg, #0ea5e9, #38bdf8)",
                        color: "#fff",
                        border: "1px solid transparent",
                        boxShadow: isToday
                          ? "0 0 10px rgba(245,158,11,0.4)"
                          : pal
                            ? `0 0 10px ${pal.from}44`
                            : "0 0 10px rgba(14,165,233,0.3)",
                      }
                    : {
                        background: "rgba(255,255,255,0.04)",
                        color: "#4b5563",
                        border: "1px solid rgba(255,255,255,0.06)",
                      }
                }
              >
                {bucket}
              </button>
            );
          })}
        </div>
        {!loading && questions.length > 0 && !isDone && (
          <span className="shrink-0 text-[11px] font-bold text-[#374151]">
            {index + 1}/{questions.length}
          </span>
        )}
      </div>

      {/* ── CARD AREA ── fills all remaining space, no outer padding ── */}
      <div className="flex-1 relative overflow-hidden">
        {loading ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
            <div
              className="w-10 h-10 rounded-full animate-spin"
              style={{
                border: "2px solid rgba(14,165,233,0.15)",
                borderTopColor: "#0ea5e9",
              }}
            />
            <p className="text-xs font-semibold text-[#374151]">Loading…</p>
          </div>
        ) : isEmpty ? (
          <div className="absolute inset-0 flex items-center justify-center p-6">
            <div
              className="rounded-2xl p-8 text-center w-full max-w-xs"
              style={cardStyle}
            >
              <div className="text-5xl mb-3">📭</div>
              <p className="text-lg font-black text-[#f0f0f8] mb-1">
                No questions yet
              </p>
              <p className="text-sm text-[#4b5563]">
                Add some via the API to get started.
              </p>
            </div>
          </div>
        ) : todayDone ? (
          <div className="absolute inset-0 flex items-center justify-center p-6">
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="rounded-2xl p-8 text-center w-full max-w-xs"
              style={cardStyle}
            >
              <div className="text-5xl mb-3">✅</div>
              <p className="text-xl font-black text-[#f0f0f8] mb-1">
                {`Today's Done!`}
              </p>
              <p className="text-sm text-[#4b5563] mb-5">
                You&apos;ve completed today&apos;s questions.
              </p>
              <button
                onClick={() => {
                  setTodayCompleted(false);
                  fetchQuestions("TODAY");
                }}
                className="w-full py-3 rounded-xl font-bold text-white text-sm"
                style={{
                  background: "linear-gradient(135deg, #f59e0b, #fbbf24)",
                  boxShadow: "0 4px 16px rgba(245,158,11,0.35)",
                }}
              >
                Practice More
              </button>
            </motion.div>
          </div>
        ) : isDone ? (
          <div className="absolute inset-0 flex items-center justify-center p-6">
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="rounded-2xl p-8 text-center w-full max-w-xs"
              style={cardStyle}
            >
              <div className="text-5xl mb-3">🎉</div>
              <p className="text-xl font-black text-[#f0f0f8] mb-1">
                All done!
              </p>
              <p className="text-sm text-[#4b5563] mb-5">
                You&apos;ve reviewed every card.
              </p>
              <button
                onClick={() => setIndex(0)}
                className="w-full py-3 rounded-xl font-bold text-white text-sm"
                style={{
                  background: "linear-gradient(135deg, #0ea5e9, #38bdf8)",
                  boxShadow: "0 4px 16px rgba(14,165,233,0.35)",
                }}
              >
                Start Over
              </button>
            </motion.div>
          </div>
        ) : (
          <>
            {/* Ghost card peeking behind */}
            {next && (
              <div
                className="absolute inset-x-2 bottom-2 top-2 rounded-xl pointer-events-none"
                style={{
                  ...cardStyle,
                  transform: "scale(0.96) translateY(8px)",
                  opacity: 0.28,
                  filter: "blur(1px)",
                }}
              />
            )}

            {/* Main card */}
            <motion.div
              key={index}
              animate={
                exiting === "left"
                  ? { x: "-115vw", rotate: -16, opacity: 0 }
                  : exiting === "right"
                    ? { x: "115vw", rotate: 16, opacity: 0 }
                    : { x: 0, opacity: 1 }
              }
              transition={{ type: "spring", stiffness: 320, damping: 32 }}
              onAnimationComplete={handleAnimationComplete}
              className="absolute inset-x-2 bottom-2 top-2 rounded-xl overflow-hidden"
              style={cardStyle}
            >
              <CardContent
                question={current}
                onImageClick={setZoomedImage}
                onLike={handleLike}
              />

              {/* Bottom action buttons */}
              <div className="absolute bottom-4 inset-x-0 flex justify-between px-4 z-30 pointer-events-none">
                <button
                  onClick={(e) => { e.stopPropagation(); handleSwipeRight(); }}
                  className="pointer-events-auto w-14 h-14 rounded-full flex items-center justify-center active:scale-95 transition-transform"
                  style={{
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    backdropFilter: "blur(8px)",
                  }}
                >
                  <span className="text-[#6b7280] text-2xl">✗</span>
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); handleSwipeLeft(); }}
                  className="pointer-events-auto w-14 h-14 rounded-full flex items-center justify-center active:scale-95 transition-transform"
                  style={{
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    backdropFilter: "blur(8px)",
                  }}
                >
                  <span className="text-[#6b7280] text-2xl">✓</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </div>
    </div>
  );
}
