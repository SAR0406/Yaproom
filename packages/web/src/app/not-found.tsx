import { PageLayout } from "@/components/PageLayout";
import { EmptyState } from "@/components/EmptyState";

export default function NotFoundPage() {
  return (
    <PageLayout>
      <EmptyState
        title="Page not found"
        description="That room code vanished into the void."
      />
    </PageLayout>
  );
}
