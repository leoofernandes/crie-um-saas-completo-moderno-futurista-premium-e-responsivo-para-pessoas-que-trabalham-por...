import { createFileRoute } from "@tanstack/react-router";
import { ExpensesPage } from "@/app/Operations";

export const Route = createFileRoute("/_authenticated/app/despesas")({ component: ExpensesPage });
