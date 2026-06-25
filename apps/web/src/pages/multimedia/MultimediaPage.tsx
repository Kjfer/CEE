import { useEffect, useState } from 'react';
import { VideoGallery } from '@/components/multimedia/VideoGallery';
import { PageHeader } from '@/components/shared/PageHeader';
import { ROUTES } from '@/constants/routes';
import type { Video } from '@cee/types';
import { mediaService } from '@/services/media.service';

export default function MultimediaPage() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const data = await mediaService.getVideos();
        setVideos(data);
      } catch (error) {
        console.error('Error fetching videos:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchVideos();
  }, []);

  return (
    <>
      <PageHeader
        eyebrow="CEE-FIIS"
        title="Multimedia"
        description="Egresados del CEE-FIIS cuentan, en sus propias palabras, cómo nuestros programas impulsaron su carrera y transformaron su forma de liderar."
        breadcrumb={[{ label: 'Inicio', path: ROUTES.HOME }, { label: 'Multimedia' }]}
        gradientClassName="bg-gradient-to-br from-cee-red-900 via-cee-red-600 to-cee-ink"
      />

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        {!isLoading && videos.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No hay videos disponibles</p>
          </div>
        ) : (
          <VideoGallery videos={videos} isLoading={isLoading} />
        )}
      </section>
    </>
  );
}
