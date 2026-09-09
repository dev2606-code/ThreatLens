"use client";

import { FormEvent, useState } from "react";
import { Loader2, ShieldPlus, X } from "lucide-react";

type AddIndicatorModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onCreated: () => void;
};

export default function AddIndicatorModal({
  isOpen,
  onClose,
  onCreated,
}: AddIndicatorModalProps) {
  const [value, setValue] = useState("");
  const [indicatorType, setIndicatorType] = useState("IP Address");
  const [score, setScore] = useState(50);
  const [source, setSource] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  if (!isOpen) {
    return null;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/api/indicators",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            value,
            indicator_type: indicatorType,
            severity_score: score,
            source,
            description: description || null,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
      const errorMessage = Array.isArray(data.detail)
  ? data.detail
      .map((error: { msg?: string }) => error.msg || "Invalid value")
      .join(", ")
  : typeof data.detail === "string"
    ? data.detail
    : "Unable to create indicator.";

     setMessage(errorMessage);
      return;
      }

      setValue("");
      setIndicatorType("IP Address");
      setScore(50);
      setSource("");
      setDescription("");

      onCreated();
      onClose();
    } catch {
      setMessage("Backend server is not available.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl border border-violet-500/20 bg-[#080c14] shadow-2xl shadow-violet-950/30">
        <div className="flex items-center justify-between border-b border-white/[0.08] p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-violet-500/10 p-2.5">
              <ShieldPlus className="h-5 w-5 text-violet-400" />
            </div>

            <div>
              <h2 className="font-semibold text-white">
                Add Indicator
              </h2>

              <p className="text-xs text-slate-500">
                Add a new IOC to ThreatLens
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-500 hover:bg-white/5 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 p-5">
          <div>
            <label className="mb-2 block text-xs font-medium text-slate-400">
              Indicator value
            </label>

            <input
              required
              value={value}
              onChange={(event) => setValue(event.target.value)}
              placeholder="IP, domain, URL or file hash"
              className="w-full rounded-xl border border-white/[0.08] bg-black/30 px-4 py-3 text-sm outline-none placeholder:text-slate-700 focus:border-violet-500/50"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-xs font-medium text-slate-400">
                Indicator type
              </label>

              <select
                value={indicatorType}
                onChange={(event) =>
                  setIndicatorType(event.target.value)
                }
                className="w-full rounded-xl border border-white/[0.08] bg-[#070a10] px-4 py-3 text-sm outline-none focus:border-violet-500/50"
              >
                <option>IP Address</option>
                <option>Domain</option>
                <option>URL</option>
                <option>File Hash</option>
                <option>Email</option>
                <option>CVE</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-xs font-medium text-slate-400">
                Source
              </label>

              <input
                required
                value={source}
                onChange={(event) => setSource(event.target.value)}
                placeholder="Example: Manual"
                className="w-full rounded-xl border border-white/[0.08] bg-black/30 px-4 py-3 text-sm outline-none placeholder:text-slate-700 focus:border-violet-500/50"
              />
            </div>
          </div>

          <div>
            <div className="mb-2 flex justify-between text-xs">
              <label className="font-medium text-slate-400">
                Risk score
              </label>

              <span className="font-semibold text-violet-400">
                {score}/100
              </span>
            </div>

            <input
              type="range"
              min="0"
              max="100"
              value={score}
              onChange={(event) =>
                setScore(Number(event.target.value))
              }
              className="w-full accent-violet-500"
            />
          </div>

          <div>
            <label className="mb-2 block text-xs font-medium text-slate-400">
              Description
            </label>

            <textarea
              value={description}
              onChange={(event) =>
                setDescription(event.target.value)
              }
              placeholder="Optional threat context"
              rows={3}
              className="w-full resize-none rounded-xl border border-white/[0.08] bg-black/30 px-4 py-3 text-sm outline-none placeholder:text-slate-700 focus:border-violet-500/50"
            />
          </div>

          {message && (
            <p className="rounded-lg bg-red-500/10 px-3 py-2 text-xs text-red-400">
              {message}
            </p>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-white/[0.08] px-5 py-2.5 text-sm text-slate-400 hover:bg-white/5"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-violet-500 disabled:opacity-60"
            >
              {loading && (
                <Loader2 className="h-4 w-4 animate-spin" />
              )}

              Save Indicator
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}