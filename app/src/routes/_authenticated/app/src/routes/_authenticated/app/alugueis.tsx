import { createFileRoute } from "@tanstack/react-router";
import { RentalsPage } from "@/components/app/Operations";

export const Route = createFileRoute("/_authenticated/app/alugueis")({ component: RentalsPage });
