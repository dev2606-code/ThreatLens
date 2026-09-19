"use client";

import { FormEvent, useState } from "react";
import {
  Loader2,
  ShieldPlus,
  X,
} from "lucide-react";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ??
  "http://127.0.0.1:8000";

type AddIndicatorModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onCreated: () => void;
};

function getErrorMessage(data: unknown): string {
  if (
    typeof data === "object" &&
    data !== null &&
    "detail" in data
  ) {
    const detail = (data as { detail: unknown }).detail;

    if (typeof detail === "string") {
      return detail;
    }

    if (Array.isArray(detail)) {
      return detail
        .map((item) => {
          if (
            typeof item === "object" &&
            item !== null &&
            "msg" in item
          ) {
            return String(item.msg);
          }

          return "Invalid form value";
        })
        .join(", ");
    }
  }

  return "Unable to create indicator.";
}

export default function AddIndicatorModal({
  isOpen,
  onClose,
  onCreated,
}: AddIndicatorModalProps) {
  const [value, setValue] = useState("");
  const [indicatorType, setIndicatorType] =
    useState("IP Address");
  const [score, setScore] = useState(50);
  const [source, setSource] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  if (!isOpen) {
    return null;
  }

  function resetForm() {
    setValue("");
    setIndicatorType("IP Address");
    setScore(50);
    setSource("");
    setDescription("");
    setMessage("");
  }

  function handleClose() {
    if (loading) {
      return;
    }

    resetForm();
    onClose();
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const token = localStorage.getItem(
        "threatlens_token",
      );

      if (!token) {
        throw new Error(
          "Your session has expired. Please sign in again.",
        );
      }

      const response = await fetch(
        `${API_URL}/api/indicators`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            value: value.trim(),
            indicator_type: indicatorType,
            severity_score: score,
            source: source.trim(),
            description:
              description.trim() || null,
          }),
        },
      );

      const data = await response
        .json()
        .catch(() => null);

      if (!response.ok) {
        throw new Error(getErrorMessage(data));
      }

      resetForm();
      onCreated();
      onClose();
    } catch (requestError) {
      setMessage(
        requestError instanceof Error
          ? requestError.message
          : "Backend server is not available.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 px-4 py-8 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-indicator-title"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          handleClose();
        }
      }}
    >
      <section className="max-h-full w-full max-w-xl overflow-y-auto rounded-3xl border border-white/[0.08] bg-[#0b0e14] p-6 shadow-2xl shadow-black/70 sm:p-8">
        <header className="mb-7 flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-violet-500/30 bg-violet-500/10 text-violet-400">
              <ShieldPlus className="h-6 w-6" />
            </div>

            <div>
              <h2
                id="add-indicator-title"
                className="text-xl font-semibold text-white"
              >
                Add threat indicator
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Store a new indicator of compromise.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClose}
            disabled={loading}
            aria-label="Close modal"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/[0.08] text-slate-500 transition hover:bg-white/[0.05] hover:text-white disabled:opacity-50"
          >
            <X className="h-5 w-5" />
          </button>
        </header>

        <form
          onSubmit={handleSubmit}
          className="space-y-5"
        >
          <div>
            <label
              htmlFor="indicator-value"
              className="mb-2 block text-sm font-medium text-slate-300"
            >
              Indicator value
            </label>

            <input
              id="indicator-value"
              type="text"
              value={value}
              onChange={(event) =>
                setValue(event.target.value)
              }
              placeholder="IP, domain, URL or file hash"
              required
              disabled={loading}
              className="h-13 w-full rounded-xl border border-white/[0.08] bg-[#070a0f] px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-700 focus:border-violet-500/60 focus:ring-4 focus:ring-violet-500/10 disabled:opacity-60"
            />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label
                htmlFor="indicator-type"
                className="mb-2 block text-sm font-medium text-slate-300"
              >
                Indicator type
              </label>

              <select
                id="indicator-type"
                value={indicatorType}
                onChange={(event) =>
                  setIndicatorType(event.target.value)
                }
                disabled={loading}
                className="h-13 w-full rounded-xl border border-white/[0.08] bg-[#070a0f] px-4 py-3 text-sm text-white outline-none transition focus:border-violet-500/60 focus:ring-4 focus:ring-violet-500/10 disabled:opacity-60"
              >
                <option value="IP Address">
                  IP Address
                </option>
                <option value="Domain">Domain</option>
                <option value="URL">URL</option>
                <option value="File Hash">
                  File Hash
                </option>
                <option value="Email">
                  Email Address
                </option>
              </select>
            </div>

            <div>
              <label
                htmlFor="indicator-source"
                className="mb-2 block text-sm font-medium text-slate-300"
              >
                Source
              </label>

              <input
                id="indicator-source"
                type="text"
                value={source}
                onChange={(event) =>
                  setSource(event.target.value)
                }
                placeholder="Manual analysis"
                required
                disabled={loading}
                className="h-13 w-full rounded-xl border border-white/[0.08] bg-[#070a0f] px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-700 focus:border-violet-500/60 focus:ring-4 focus:ring-violet-500/10 disabled:opacity-60"
              />
            </div>
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <label
                htmlFor="severity-score"
                className="text-sm font-medium text-slate-300"
              >
                Severity score
              </label>

              <span
                className={`rounded-lg px-2.5 py-1 text-xs font-semibold ${
                  score >= 90
                    ? "bg-red-500/10 text-red-400"
                    : score >= 70
                      ? "bg-orange-500/10 text-orange-400"
                      : score >= 40
                        ? "bg-violet-500/10 text-violet-400"
                        : "bg-cyan-500/10 text-cyan-400"
                }`}
              >
                {score}/100
              </span>
            </div>

            <input
              id="severity-score"
              type="range"
              min="0"
              max="100"
              value={score}
              onChange={(event) =>
                setScore(Number(event.target.value))
              }
              disabled={loading}
              className="w-full accent-violet-500"
            />

            <div className="mt-1 flex justify-between text-xs text-slate-700">
              <span>Low</span>
              <span>Critical</span>
            </div>
          </div>

          <div>
            <label
              htmlFor="indicator-description"
              className="mb-2 block text-sm font-medium text-slate-300"
            >
              Description
              <span className="ml-1 text-slate-600">
                (optional)
              </span>
            </label>

            <textarea
              id="indicator-description"
              value={description}
              onChange={(event) =>
                setDescription(event.target.value)
              }
              placeholder="Add investigation notes or context..."
              rows={4}
              disabled={loading}
              className="w-full resize-none rounded-xl border border-white/[0.08] bg-[#070a0f] px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-700 focus:border-violet-500/60 focus:ring-4 focus:ring-violet-500/10 disabled:opacity-60"
            />
          </div>

          {message && (
            <div className="rounded-xl border border-red-500/20 bg-red-500/[0.08] px-4 py-3 text-sm text-red-300">
              {message}
            </div>
          )}

          <footer className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="rounded-xl border border-white/[0.08] bg-white/[0.03] px-5 py-3 text-sm font-semibold text-slate-300 transition hover:bg-white/[0.07] disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-950/30 transition hover:from-violet-500 hover:to-purple-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <ShieldPlus className="h-4 w-4" />
                  Add indicator
                </>
              )}
            </button>
          </footer>
        </form>
      </section>
    </div>
  );
}