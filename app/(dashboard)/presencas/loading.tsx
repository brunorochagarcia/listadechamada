export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="h-7 w-52 bg-gray-200 rounded animate-pulse" />
        <div className="h-4 w-64 bg-gray-100 rounded animate-pulse" />
      </div>
      <div className="flex gap-3">
        <div className="h-9 w-40 bg-gray-100 rounded-lg animate-pulse" />
        <div className="h-9 w-36 bg-gray-100 rounded-lg animate-pulse" />
        <div className="h-9 w-24 bg-gray-200 rounded-lg animate-pulse" />
      </div>
    </div>
  );
}
