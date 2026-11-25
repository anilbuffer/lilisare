import { redirect } from "next/navigation";
import { INITIAL_CLIENTS } from "@/lib/clients/mockData";

export default async function IntakePatientRedirectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  redirect(`/intake/clients/${resolvedParams.id}`);
}

export function generateStaticParams() {
  return INITIAL_CLIENTS.map((c) => ({ id: c.id }));
}
