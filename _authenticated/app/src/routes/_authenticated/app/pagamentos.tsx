import { createFileRoute } from "@tanstack/react-router";
import { PaymentsPage } from "@/app/Operations";

export const Route = createFileRoute("/_authenticated/app/pagamentos")({ component: PaymentsPage });
