import { Skeleton } from "@/components/ui/skeleton";

export default function WorkoutLoading() {
  return (
    <div className="container py-8 max-w-2xl space-y-6">
      <Skeleton className="h-10 w-64" />
      {[1, 2, 3, 4].map((i) => (
        <Skeleton key={i} className="h-40 w-full rounded-xl" />
      ))}
    </div>
  );
}
