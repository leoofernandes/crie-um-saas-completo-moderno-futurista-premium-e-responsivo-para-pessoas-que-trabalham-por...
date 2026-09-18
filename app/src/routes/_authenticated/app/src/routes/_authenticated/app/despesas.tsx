import { createFileRoute } from "@tanstack/react-router";
import { ExpensesPage } from "@/components/app/Operations";

export const Route = createFileRoute("/_authenticated/app/despesas")({ component: ExpensesPage });
