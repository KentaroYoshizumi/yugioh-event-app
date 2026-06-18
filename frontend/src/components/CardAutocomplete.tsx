"use client";

import { useState, useEffect, useRef } from "react";

interface CardSuggestion {
  id: number;
  name: string;
  type: string;
}

interface Props {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function CardAutocomplete({ value, onChange, placeholder, className }: Props) {
  const [suggestions, setSuggestions] = useState<CardSuggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (!value || value.length < 2) {
      setSuggestions([]);
      setOpen(false);
      return;
    }
    timerRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `https://db.ygoprodeck.com/api/v7/cardinfo.php?fname=${encodeURIComponent(value)}&num=8&offset=0`
        );
        const data = await res.json();
        if (data.data) {
          setSuggestions(data.data.map((c: { id: number; name: string; type: string }) => ({ id: c.id, name: c.name, type: c.type })));
          setOpen(true);
        } else {
          setSuggestions([]);
          setOpen(false);
        }
      } catch {
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    }, 300);
  }, [value]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div ref={containerRef} className="relative">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={className}
        autoComplete="off"
      />
      {loading && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">
          検索中...
        </div>
      )}
      {open && suggestions.length > 0 && (
        <ul className="absolute z-50 left-0 right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
          {suggestions.map((s) => (
            <li
              key={s.id}
              onMouseDown={() => {
                onChange(s.name);
                setOpen(false);
              }}
              className="px-3 py-2 hover:bg-purple-50 cursor-pointer border-b border-gray-50 last:border-0"
            >
              <span className="text-sm font-medium text-gray-800">{s.name}</span>
              <span className="text-xs text-gray-400 ml-2">{s.type}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

interface CardListBuilderProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export function CardListBuilder({ value, onChange, className }: CardListBuilderProps) {
  const [search, setSearch] = useState("");
  const [suggestions, setSuggestions] = useState<CardSuggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (!search || search.length < 2) {
      setSuggestions([]);
      setOpen(false);
      return;
    }
    timerRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `https://db.ygoprodeck.com/api/v7/cardinfo.php?fname=${encodeURIComponent(search)}&num=8&offset=0`
        );
        const data = await res.json();
        if (data.data) {
          setSuggestions(data.data.map((c: { id: number; name: string; type: string }) => ({ id: c.id, name: c.name, type: c.type })));
          setOpen(true);
        } else {
          setSuggestions([]);
          setOpen(false);
        }
      } catch {
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    }, 300);
  }, [search]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const addCard = (name: string) => {
    const line = `1 ${name}`;
    onChange(value ? `${value}\n${line}` : line);
    setSearch("");
    setOpen(false);
  };

  const inputBase =
    "w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#7b2d8b] focus:border-transparent";

  return (
    <div className="space-y-2">
      <div ref={containerRef} className="relative">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="カード名で検索して追加（英語名）"
          className={inputBase}
          autoComplete="off"
        />
        {loading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">
            検索中...
          </div>
        )}
        {open && suggestions.length > 0 && (
          <ul className="absolute z-50 left-0 right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
            {suggestions.map((s) => (
              <li
                key={s.id}
                onMouseDown={() => addCard(s.name)}
                className="px-3 py-2 hover:bg-purple-50 cursor-pointer border-b border-gray-50 last:border-0"
              >
                <span className="text-sm font-medium text-gray-800">{s.name}</span>
                <span className="text-xs text-gray-400 ml-2">{s.type}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
      <textarea
        placeholder="カードリスト（自由形式）"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={5}
        className={`${className} resize-none font-mono text-xs`}
      />
    </div>
  );
}
