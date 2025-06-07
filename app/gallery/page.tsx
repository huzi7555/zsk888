export default function GalleryPage() {
  return (
    <div className="py-8 px-4 min-h-screen">
      {" "}
      {/* Removed explicit background */}
      <section className="mx-auto w-full max-w-[1200px] px-10 py-8 bg-white/70 backdrop-blur rounded-2xl shadow-xl shadow-black/5 ring-1 ring-white/30 relative dark:bg-gray-800/70 dark:ring-gray-700/30">
        <div className="text-center py-20">
          <h1 className="text-2xl font-semibold text-gray-900 mb-4 dark:text-gray-100">🖼️ 画廊</h1>
          <p className="text-gray-500 dark:text-gray-400">敬请期待</p>
        </div>
      </section>
    </div>
  )
}
