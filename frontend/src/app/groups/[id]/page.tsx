import { Suspense } from "react";
import GroupDetailsClient from "./GroupDetailsClient";

export default function GroupDetailsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[40vh] items-center justify-center text-muted-foreground">
          Loading...
        </div>
      }
    >
      <GroupDetailsClient />
    </Suspense>
  );
}
