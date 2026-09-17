import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/app/AppShell";

export const Route = createFileRoute("/_authenticated/app")({ component: AppShell });