import { createFileRoute } from "@tanstack/react-router";
import { VehiclesPage } from "@/components/app/Operations";

export const Route = createFileRoute("/_authenticated/app/veiculos")({ component: VehiclesPage });
