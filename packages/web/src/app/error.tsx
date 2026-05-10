"use client";

import { PageLayout } from "@/components/PageLayout";
import { EmptyState } from "@/components/EmptyState";

export default function ErrorPage() {
  return (
    <PageLayout>
      <EmptyState
        title="Something went wrong"
        description="The chaos broke. Refresh to try again."
      />
    </PageLayout>
  );
}
