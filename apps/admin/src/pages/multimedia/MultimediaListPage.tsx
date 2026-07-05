import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Edit2, Plus, Trash2, Video as VideoIcon } from 'lucide-react';
import type { Video } from '@cee/types';
import { Button } from '@/components/ui/button';
import { mediaService } from '@/services/mediaService';
import { useToast } from '@/hooks/useToast';

export default function MultimediaListPage() {
  const { success, error } = useToast();
  const [videos, setVideos] = useState<Video[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  useEffect(() => {
    loadVideos();
  }, []);

  const loadVideos = async () => {
    try {
      const response = await mediaService.getVideos();
      setVideos(response.data);
    } catch (err) {
      error('Error', err instanceof Error ? err.message : 'No se pudieron cargar los videos.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar este video?')) return;
    setIsDeleting(id);
    try {
      await mediaService.deleteVideo(id);
      success('Video eliminado', 'El video ha sido borrado exitosamente.');
      setVideos((prev) => prev.filter((v) => v.id !== id));
    } catch (err) {
      error('Error', err instanceof Error ? err.message : 'No se pudo eliminar el video.');
    } finally {
      setIsDeleting(null);
    }
  };

  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Multimedia</h1>
          <p className="mt-0.5 text-sm text-[#A9A9A9]">
            Gestiona los videos de la plataforma.
          </p>
        </div>
        <Link
          to="/multimedia/nuevo"
          className="flex items-center gap-2 rounded-lg bg-[#682222] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#4F1A1A] focus:outline-none focus:ring-2 focus:ring-[#682222]/40"
        >
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Video
        </Link>
      </div>

      <div className="rounded-xl border bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-6 py-4 font-medium">Video</th>
                <th className="px-6 py-4 font-medium">Categoría</th>
                <th className="px-6 py-4 font-medium">Duración (seg)</th>
                <th className="px-6 py-4 font-medium text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-muted-foreground">
                    Cargando videos...
                  </td>
                </tr>
              ) : videos.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-muted-foreground">
                    No hay videos registrados.
                  </td>
                </tr>
              ) : (
                videos.map((video) => (
                  <tr key={video.id} className="group hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {video.thumbnailUrl ? (
                          <img
                            src={video.thumbnailUrl}
                            alt={video.title}
                            className="h-10 w-16 rounded object-cover"
                          />
                        ) : (
                          <div className="flex h-10 w-16 items-center justify-center rounded bg-slate-100 text-slate-400">
                            <VideoIcon className="h-5 w-5" />
                          </div>
                        )}
                        <div>
                          <p className="font-medium">{video.title}</p>
                          <a href={video.videoUrl} target="_blank" rel="noreferrer" className="text-xs text-cee-red hover:underline">
                            Ver video
                          </a>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700">
                        {video.category || 'Sin categoría'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {video.duration}s
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          asChild
                          className="h-8 w-8 hover:text-cee-red hover:bg-red-50"
                        >
                          <Link to={`/multimedia/${video.id}/editar`}>
                            <Edit2 className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 hover:text-red-600 hover:bg-red-50"
                          disabled={isDeleting === video.id}
                          onClick={() => handleDelete(video.id)}
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
