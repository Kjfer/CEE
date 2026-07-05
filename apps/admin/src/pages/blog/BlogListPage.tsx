import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Edit2, Plus, Trash2, FileText } from 'lucide-react';
import type { BlogPost } from '@cee/types';
import { Button } from '@/components/ui/button';
import { blogService } from '@/services/blogService';
import { useToast } from '@/hooks/useToast';

export default function BlogListPage() {
  const { success, error } = useToast();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    try {
      const response = await blogService.getPosts();
      setPosts(response.data);
    } catch (err) {
      error('Error', err instanceof Error ? err.message : 'No se pudieron cargar los posts.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar este artículo del blog?')) return;
    setIsDeleting(id);
    try {
      await blogService.deletePost(id);
      success('Post eliminado', 'El artículo ha sido borrado exitosamente.');
      setPosts((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      error('Error', err instanceof Error ? err.message : 'No se pudo eliminar el artículo.');
    } finally {
      setIsDeleting(null);
    }
  };

  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Blog</h1>
          <p className="mt-0.5 text-sm text-[#A9A9A9]">
            Gestiona las publicaciones del blog oficial.
          </p>
        </div>
        <Link
          to="/blog/nuevo"
          className="flex items-center gap-2 rounded-lg bg-[#682222] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#4F1A1A] focus:outline-none focus:ring-2 focus:ring-[#682222]/40"
        >
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Post
        </Link>
      </div>

      <div className="rounded-xl border bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-6 py-4 font-medium">Publicación</th>
                <th className="px-6 py-4 font-medium">Fecha</th>
                <th className="px-6 py-4 font-medium text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {isLoading ? (
                <tr>
                  <td colSpan={3} className="px-6 py-8 text-center text-muted-foreground">
                    Cargando blog...
                  </td>
                </tr>
              ) : posts.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-6 py-8 text-center text-muted-foreground">
                    No hay publicaciones en el blog.
                  </td>
                </tr>
              ) : (
                posts.map((post) => (
                  <tr key={post.id} className="group hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {post.imageUrl ? (
                          <img
                            src={post.imageUrl}
                            alt={post.title}
                            className="h-10 w-16 rounded object-cover"
                          />
                        ) : (
                          <div className="flex h-10 w-16 items-center justify-center rounded bg-slate-100 text-slate-400">
                            <FileText className="h-5 w-5" />
                          </div>
                        )}
                        <div>
                          <p className="font-medium line-clamp-1">{post.title}</p>
                          <p className="text-xs text-muted-foreground line-clamp-1">{post.summary}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-slate-600">
                      {new Date(post.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          asChild
                          className="h-8 w-8 hover:text-cee-red hover:bg-red-50"
                        >
                          <Link to={`/blog/${post.id}/editar`}>
                            <Edit2 className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 hover:text-red-600 hover:bg-red-50"
                          disabled={isDeleting === post.id}
                          onClick={() => handleDelete(post.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
