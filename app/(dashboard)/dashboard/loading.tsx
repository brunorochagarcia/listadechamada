export default function Loading() {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <div className="h-7 w-32 bg-gray-200 rounded animate-pulse" />
        <div className="h-4 w-48 bg-gray-100 rounded animate-pulse" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-200 p-5 space-y-3">
            <div className="h-5 w-16 bg-gray-200 rounded animate-pulse" />
            <div className="h-3 w-28 bg-gray-100 rounded animate-pulse" />
            <div className="flex gap-2">
              <div className="h-5 w-20 bg-gray-100 rounded-full animate-pulse" />
              <div className="h-5 w-20 bg-gray-100 rounded-full animate-pulse" />
            </div>
          </div>
        ))}
      </div>
      <div className="space-y-2">
        <div className="h-5 w-40 bg-gray-200 rounded animate-pulse" />
        <div className="bg-white rounded-xl border border-gray-200">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex justify-between px-4 py-3 border-b border-gray-100 last:border-0">
              <div className="space-y-1">
                <div className="h-4 w-36 bg-gray-200 rounded animate-pulse" />
                <div className="h-3 w-28 bg-gray-100 rounded animate-pulse" />
              </div>
              <div className="h-5 w-10 bg-red-100 rounded animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
