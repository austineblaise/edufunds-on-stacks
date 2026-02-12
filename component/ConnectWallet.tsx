// components/ConnectWallet.tsx
'use client';

import React, { useEffect, useRef, useState } from 'react';
import { connect, disconnect } from '@stacks/connect';

function truncateAddress(addr: string | null) {
  if (!addr) return '';
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

function addressGradient(addr: string | null) {
  if (!addr) return 'linear-gradient(135deg,#94f9c1,#60a5fa)';
  // simple deterministic hues from address chars
  let sum = 0;
  for (let i = 0; i < addr.length; i++) sum += addr.charCodeAt(i);
  const h1 = sum % 360;
  const h2 = (h1 + 60) % 360;
  return `linear-gradient(135deg,hsl(${h1} 85% 45%), hsl(${h2} 85% 40%))`;
}

export default function ConnectWallet() {
  const [connected, setConnected] = useState(false);
  const [address, setAddress] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  async function handleConnect() {
    try {
      setLoading(true);
      const res: any = await connect();
      // account for different wallet response shapes
      const chosen =
        res?.addresses?.[0]?.address ??
        res?.profile?.stxAddress ??
        res?.address ??
        null;
      setAddress(chosen);
      setConnected(Boolean(chosen));
    } catch (err) {
      console.error('connect error', err);
      setConnected(false);
      setAddress(null);
    } finally {
      setLoading(false);
    }
  }

  function handleDisconnect() {
    try {
      disconnect();
      setConnected(false);
      setAddress(null);
      setMenuOpen(false);
    } catch (err) {
      console.error('disconnect error', err);
    }
  }

  async function handleCopy() {
    if (!address) return;
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch (err) {
      console.error('copy failed', err);
    }
  }

  // close menu on outside click
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [menuOpen]);

  return (
    <div className="relative" ref={menuRef}>
      {/* Not connected */}
      {!connected && (
        <button
          onClick={handleConnect}
          disabled={loading}
          className="inline-flex items-center gap-3 rounded-full bg-gradient-to-r from-emerald-500 to-sky-500 px-4 py-2 text-sm font-semibold text-white shadow-md transition-transform hover:-translate-y-0.5 active:scale-95 disabled:opacity-60"
          aria-label="Connect Stacks Wallet"
          title="Connect Stacks Wallet"
        >
          <svg
            className="h-5 w-5 flex-shrink-0"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M4 12c2-4 6-8 10-8s8 4 10 8c-2 4-6 8-10 8S6 16 4 12z"
              stroke="rgba(255,255,255,0.95)"
              strokeWidth="1.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M12 8v4l2 2"
              stroke="rgba(255,255,255,0.95)"
              strokeWidth="1.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>

          <span>Connect</span>
          <span className="text-xs opacity-90">Stacks</span>
          {loading && (
            <svg
              className="ml-2 h-4 w-4 animate-spin text-white"
              viewBox="0 0 24 24"
              fill="none"
            >
              <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.6)" strokeWidth="3" />
              <path d="M22 12a10 10 0 00-10-10" stroke="white" strokeWidth="3" strokeLinecap="round" />
            </svg>
          )}
        </button>
      )}

      {/* Connected */}
      {connected && address && (
        <>
          <button
            onClick={() => setMenuOpen((s) => !s)}
            className="inline-flex items-center gap-3 rounded-full bg-white px-3 py-1.5 text-sm font-medium text-slate-800 shadow-sm ring-1 ring-black/5 hover:shadow-md transition"
            aria-expanded={menuOpen}
            aria-haspopup="true"
          >
            {/* avatar */}
            <span
              className="inline-flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold text-white shadow-sm"
              style={{ background: addressGradient(address) }}
              aria-hidden="true"
            >
              {address.slice(2, 4).toUpperCase()}
            </span>

            {/* truncated address */}
            <span className="min-w-[90px]">{truncateAddress(address)}</span>

            {/* chevron */}
            <svg
              className={`h-4 w-4 transition-transform ${menuOpen ? 'rotate-180' : 'rotate-0'}`}
              viewBox="0 0 24 24"
              fill="none"
            >
              <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          {/* dropdown menu */}
          {menuOpen && (
            <div className="absolute right-0 top-full mt-2 w-52 overflow-hidden rounded-xl bg-white p-2 shadow-xl ring-1 ring-black/5 animate-fade-in z-50">
              <div className="px-3 py-2">
                <div className="mb-2 text-xs text-slate-500">Connected address</div>
                <div className="flex items-center justify-between gap-2">
                  <div className="truncate rounded-md bg-slate-50 px-2 py-1 text-sm font-mono text-slate-700">
                    {address}
                  </div>
                  <button
                    onClick={handleCopy}
                    className="ml-2 rounded-md px-2 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                    aria-label="Copy address"
                    title="Copy address"
                  >
                    {copied ? 'Copied' : 'Copy'}
                  </button>
                </div>
              </div>

              <div className="border-t border-slate-100" />

              <div className="flex flex-col gap-2 p-3">
                <a
                  href={`https://explorer.stacks.co/address/${address}?chain=testnet`}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-md px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
                >
                  View on Explorer
                </a>

                <button
                  onClick={handleDisconnect}
                  className="rounded-md bg-rose-500 px-3 py-2 text-sm font-semibold text-white hover:bg-rose-600 transition"
                >
                  Disconnect
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
