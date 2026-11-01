/** Simple skeleton/loading helpers shared across dashboard cards */

export function CardSkeleton() {
  return <div className="animate-pulse bg-gray-200 rounded-2xl h-36 w-full" />;
}

export function InlineError({ message }: { message?: string }) {
  return (
    <p className="text-xs text-red-400 mt-1">
      {message ?? "Failed to load data"}
    </p>
  );
}
