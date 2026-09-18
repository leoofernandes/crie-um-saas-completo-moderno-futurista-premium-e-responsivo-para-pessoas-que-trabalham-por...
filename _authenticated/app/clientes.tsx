import { createFileRoute } from "@tanstack/react-router";
import { CustomersPage } from "@/app/Operations";

export const Route = createFileRoute("/_authenticated/app/clientes")({ component: CustomersPage });
