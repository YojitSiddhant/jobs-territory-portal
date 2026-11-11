export default function Home() {
  return (
    <main className="flex flex-1 items-center justify-center bg-zinc-950 px-6 py-20 text-zinc-100">
      <section className="w-full max-w-3xl space-y-8">
        <p className="text-sm font-medium uppercase tracking-[0.3em] text-emerald-400">Jobs Territory</p>
        <h1 className="max-w-2xl text-5xl font-semibold tracking-tight sm:text-6xl">A trusted foundation for better careers.</h1>
        <p className="max-w-xl text-lg leading-8 text-zinc-400">The candidate job portal foundation is ready for authentication, verified companies, private documents, job discovery, and applications.</p>
        <div className="flex flex-wrap gap-3 text-sm text-zinc-300">
          <span className="rounded-full border border-zinc-700 px-4 py-2">Candidate-first</span>
          <span className="rounded-full border border-zinc-700 px-4 py-2">Verified companies</span>
          <span className="rounded-full border border-zinc-700 px-4 py-2">Private files</span>
        </div>
      </section>
    </main>
  );
}
