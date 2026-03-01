export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-pulse-darker">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="h-8 w-48 bg-pulse-card rounded animate-pulse" />
          <div className="h-10 w-32 bg-pulse-card rounded animate-pulse" />
        </div>
        <div className="h-32 bg-pulse-card border border-pulse-border rounded-xl mb-8 animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="h-40 bg-pulse-card border border-pulse-border rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    </div>
  );
}
