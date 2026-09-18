import { createFileRoute } from "@tanstack/react-router";
import { MaintenancesPage } from "@/components/app/Operations";

export const Route = createFileRoute("/_authenticated/app/manutencoes")({ component: MaintenancesPage });
