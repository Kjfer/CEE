import { useState, useEffect } from 'react';
import { settingsService } from '@/services/settings.service';
import type { SiteSettings } from '@cee/types';

export function useSiteSettings() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    settingsService.getSiteSettings()
      .then(res => {
        if (mounted) setSettings(res.data);
      })
      .catch(console.error)
      .finally(() => {
        if (mounted) setIsLoading(false);
      });
    
    return () => { mounted = false; };
  }, []);

  return { settings, isLoading };
}
