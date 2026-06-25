import { BlogCard } from '@/components/blog/BlogCard';
import { PageHeader } from '@/components/shared/PageHeader';
import { ROUTES } from '@/constants/routes';
import { useBlog } from '@/hooks/useBlog';
import { useScrollReveal } from '@/hooks/useScrollReveal';

export default function BlogPage() {
  const { posts, isLoading } = useBlog();
  const gridRef = useScrollReveal<HTMLDivElement>({ selector: ':scope > *' });

  return (
    <>
      <PageHeader
        eyebrow="CEE-FIIS"
        title="Blog"
        description="Noticias, casos y análisis sobre liderazgo, gestión y especialización profesional."
        breadcrumb={[{ label: 'Inicio', path: ROUTES.HOME }, { label: 'Blog' }]}
        size="md"
      />

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        {isLoading ? (
          <p className="text-center text-muted-foreground">Cargando entradas...</p>
        ) : posts.length === 0 ? (
          <p className="text-center text-muted-foreground">No hay entradas disponibles por ahora.</p>
        ) : (
          <div ref={gridRef} className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <BlogCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </section>
    </>
  );
}
