"use client";

import Link from "next/link";

/**
 * Harsh Tailwind test page.
 * Uses ONLY Tailwind utility classes — no custom CSS from globals.
 * If Tailwind is broken: you see plain black text, no colors, no layout.
 * If Tailwind works: you see colored boxes, grid, rounded corners, shadows, responsive layout.
 */
export default function TailwindTestPage() {
  return (
    <div className="min-h-screen bg-gray-50 px-6 py-10 sm:px-8 sm:py-12">
      <div className="mx-auto max-w-3xl space-y-10">
        {/* Header - very obvious if Tailwind works */}
        <div className="rounded-xl border-2 border-orange-500 bg-orange-100 px-6 py-8 text-center sm:px-8 sm:py-10">
          <h1 className="text-3xl font-bold tracking-tight text-orange-800">
            Tailwind harsh test
          </h1>
          <p className="mt-2 text-orange-700">
            If you see this box with orange background, rounded corners, and
            bold title — Tailwind is working. If it looks like plain text with
            no box/color — Tailwind is NOT loading.
          </p>
        </div>

        {/* Status strip */}
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
          <div className="rounded-lg bg-red-500 px-4 py-3 text-center font-semibold text-white">
            red-500
          </div>
          <div className="rounded-lg bg-blue-500 px-4 py-3 text-center font-semibold text-white">
            blue-500
          </div>
          <div className="rounded-lg bg-green-500 px-4 py-3 text-center font-semibold text-white">
            green-500
          </div>
          <div className="rounded-lg bg-amber-500 px-4 py-3 text-center font-semibold text-white">
            amber-500
          </div>
        </div>

        {/* Typography */}
        <div className="space-y-3 rounded-lg border border-gray-200 bg-white p-6 shadow-md sm:p-8">
          <h2 className="text-xl font-bold text-gray-900">Typography</h2>
          <p className="text-base text-gray-600">
            Base text. <span className="font-bold">Bold</span>,{" "}
            <span className="italic">italic</span>,{" "}
            <span className="text-sm text-gray-500">small muted</span>.
          </p>
          <p className="text-2xl font-extrabold text-gray-800">
            Large bold (text-2xl font-extrabold)
          </p>
        </div>

        {/* Spacing & layout */}
        <div className="flex flex-wrap justify-center gap-6 py-4">
          <div className="h-20 w-20 rounded-full bg-purple-500" />
          <div className="h-20 w-20 rounded-full bg-pink-500" />
          <div className="h-20 w-20 rounded-full bg-cyan-500" />
        </div>

        {/* Responsive grid - 1 col mobile, 3 col desktop */}
        <div className="rounded-lg border-2 border-dashed border-gray-300 bg-gray-100 p-6 sm:p-8">
          <h2 className="mb-5 text-lg font-semibold text-gray-800">
            Responsive grid (3 cols on md+)
          </h2>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            <div className="rounded-lg bg-white p-5 shadow">
              <div className="text-sm font-medium text-gray-500">Col 1</div>
              <div className="mt-1 text-gray-900">md:grid-cols-3</div>
            </div>
            <div className="rounded-lg bg-white p-5 shadow">
              <div className="text-sm font-medium text-gray-500">Col 2</div>
              <div className="mt-1 text-gray-900">md:grid-cols-3</div>
            </div>
            <div className="rounded-lg bg-white p-5 shadow">
              <div className="text-sm font-medium text-gray-500">Col 3</div>
              <div className="mt-1 text-gray-900">md:grid-cols-3</div>
            </div>
          </div>
        </div>

        {/* Hover state */}
        <div className="rounded-lg bg-gray-200 p-4">
          <h2 className="mb-2 text-lg font-semibold text-gray-800">
            Hover test
          </h2>
          <button
            type="button"
            className="rounded-lg bg-indigo-600 px-4 py-2 font-medium text-white transition-colors hover:bg-indigo-700"
          >
            Hover me (should darken)
          </button>
        </div>

        {/* Summary */}
        <div className="rounded-xl bg-gray-900 p-6 text-white">
          <h2 className="text-xl font-bold">Checklist</h2>
          <ul className="mt-3 list-inside list-disc space-y-1 text-gray-300">
            <li>Orange header box with border and padding</li>
            <li>Four colored boxes (red, blue, green, amber)</li>
            <li>White card with shadow and rounded corners</li>
            <li>Three circles (purple, pink, cyan)</li>
            <li>Grid that changes columns on larger screens</li>
            <li>Indigo button that darkens on hover</li>
          </ul>
          <p className="mt-4 text-sm text-gray-400">
            If all of the above look styled, Tailwind is working. If everything
            is plain/unstyled, Tailwind is not loading — check postcss config,
            tailwind import in globals.css, and build.
          </p>
        </div>

        <div className="flex justify-center pb-8">
          <Link
            href="/"
            className="rounded-lg bg-gray-800 px-6 py-2 font-medium text-white hover:bg-gray-700"
          >
            Back to app
          </Link>
        </div>
      </div>
    </div>
  );
}
