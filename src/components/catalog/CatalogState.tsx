import { Button } from "@/components/ui/button";

export function CatalogNotFound() {
  return <main className="catalog-root grid min-h-screen place-content-center gap-3 px-6 text-center"><h1 className="text-3xl font-semibold">Catálogo não encontrado</h1><p className="text-(--c-mute)">Esse link não existe ou o catálogo ainda não foi publicado.</p></main>;
}

export function CatalogError({ reset }: { reset: () => void }) {
  return <main className="catalog-root grid min-h-screen place-content-center gap-4 px-6 text-center"><h1 className="text-2xl font-semibold">Não foi possível carregar o catálogo.</h1><Button onClick={reset} variant="outline">Tentar novamente</Button></main>;
}