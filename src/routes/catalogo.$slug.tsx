import { createFileRoute, Outlet } from "@tanstack/react-router";
export const Route = createFileRoute("/catalogo/$slug")({ component: () => <Outlet /> });
