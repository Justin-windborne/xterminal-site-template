export default function BlogPage() {
  return (
    <section className="mb-20 border border-stone-800 bg-stone-950/80 p-6 sm:mb-24 md:mb-32 lg:mb-36">
      <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-stone-400">Blog</p>
      <h1 className="mt-2 font-sans text-3xl font-semibold tracking-tight text-white">Blog Placeholder</h1>
      <p className="mt-3 max-w-3xl text-sm text-stone-400">
        Wire runtime post listing here using `getRuntimeBlogPosts()` when this client site needs dynamic blog reads.
      </p>
    </section>
  )
}
