import { useEffect, useState } from 'react';
import { X, Loader2, ImageIcon } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';

interface Props {
  onClose: () => void;
  onSelect: (url: string) => void;
}

export function ImageGalleryModal({ onClose, onSelect }: Props) {
  const [images, setImages] = useState<{ name: string; url: string }[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchImages = async () => {
      try {
        const { data, error } = await supabase.storage.from('course-images').list('courses', {
          limit: 100,
          offset: 0,
          sortBy: { column: 'created_at', order: 'desc' }
        });

        if (error) throw error;
        
        if (!isMounted) return;

        const urls = data
          .filter(f => f.name !== '.emptyFolderPlaceholder')
          .map(file => {
            const { data: urlData } = supabase.storage.from('course-images').getPublicUrl(`courses/${file.name}`);
            return { name: file.name, url: urlData.publicUrl };
          });

        setImages(urls);
      } catch (err) {
        console.error('Error fetching images', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    fetchImages();
    return () => { isMounted = false; };
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-4xl flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <div>
            <h2 className="text-lg font-semibold">Banco de Imágenes</h2>
            <p className="text-sm text-muted-foreground">Selecciona una imagen que ya haya sido subida anteriormente.</p>
          </div>
          <button 
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded-full hover:bg-muted"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto flex-1">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
              <Loader2 className="h-8 w-8 animate-spin mb-2" />
              <p>Cargando imágenes...</p>
            </div>
          ) : images.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-muted-foreground border-2 border-dashed rounded-lg">
              <ImageIcon className="h-10 w-10 mb-2 opacity-50" />
              <p>No hay imágenes subidas en el banco.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {images.map(img => (
                <button
                  key={img.name}
                  type="button"
                  onClick={() => onSelect(img.url)}
                  className="group relative aspect-video border rounded-lg overflow-hidden bg-muted/10 hover:ring-2 hover:ring-primary focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                >
                  <img src={img.url} alt={img.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="border-t p-4 flex justify-end bg-muted/20">
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
        </div>
      </div>
    </div>
  );
}
