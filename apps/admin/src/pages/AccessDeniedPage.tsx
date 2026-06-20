export default function AccessDeniedPage() {
  return (
    <main className="grid min-h-screen place-items-center bg-cee-cream px-4 text-center">
      <section>
        <p className="text-sm font-semibold uppercase tracking-wide text-cee-red">CEE Admin</p>
        <h1 className="mt-3 text-3xl font-bold text-neutral-950">Acceso denegado</h1>
        <p className="mt-2 text-muted-foreground">
          No tienes permisos de administrador para ver esta sección.
        </p>
      </section>
    </main>
  );
}
