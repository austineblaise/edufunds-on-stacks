// app/page.tsx
import React from "react";

export default function HomePage() {
  return (
  
    <div className="min-h-[84vh] bg-slate-900 text-white flex items-center">
      <div className="mx-auto w-full max-w-4xl px-6 py-20 text-center">
        <h1
          className="mb-6 text-5xl sm:text-6xl md:text-7xl font-extrabold leading-tight"
          style={{ lineHeight: 1.02 }}
        >
          <span className="bg-gradient-to-r from-emerald-400 to-sky-500 bg-clip-text text-transparent">
            Welcome to EduFunds
          </span>
        </h1>

        <p className="mx-auto max-w-2xl text-lg sm:text-xl text-slate-300 mb-10">
          A Stacks-powered platform for managing student stipends — with smart spending controls,
          automated savings, real-time withdrawal tracking, and transparent fund allocation
          between parents and students.
        </p>

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center sm:gap-6">
          <a
            href="#parent"
            className="inline-flex items-center justify-center rounded-xl bg-emerald-600 px-6 py-3 text-sm font-semibold shadow hover:bg-emerald-700 transition"
          >
            I’m a Parent
          </a>

          <a
            href="#student"
            className="inline-flex items-center justify-center rounded-xl bg-sky-600 px-6 py-3 text-sm font-semibold shadow hover:bg-sky-700 transition"
          >
            I’m a Student
          </a>
        </div>

        <div className="mt-14 text-sm text-slate-400">
          Built on{" "}
          <a
            className="text-emerald-400 hover:underline"
            href="#"
           
          >
            Stacks
          </a>
        </div>
      </div>
    </div>
  );
}
