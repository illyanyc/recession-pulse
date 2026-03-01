export default function Loading() {
  return (
    <div className="min-h-screen bg-pulse-darker flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="h-10 w-10 border-2 border-pulse-green/20 border-t-pulse-green rounded-full animate-spin" />
        <p className="text-sm text-pulse-muted">Loading...</p>
      </div>
    </div>
  );
}
