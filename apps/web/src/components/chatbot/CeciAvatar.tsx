import ceciBust from '@/assets/chatbot/ceci_bust.png';
import ceciHero from '@/assets/chatbot/ceci_hero.png';

export function CeciCompact() {
  return (
    <img
      src={ceciBust}
      alt="Ceci"
      className="ceci-avatar-img"
      draggable={false}
    />
  );
}

export function CeciFullBody() {
  return (
    <div className="relative w-full h-full">
      <img
        src={ceciHero}
        alt="Ceci"
        className="ceci-hero-img relative z-[2]"
        draggable={false}
      />
      <div
        className="cee-hero-scan absolute inset-0 z-[3] pointer-events-none"
        aria-hidden="true"
        style={{
          WebkitMaskImage: `url(${ceciHero})`,
          maskImage: `url(${ceciHero})`,
          WebkitMaskRepeat: 'no-repeat',
          maskRepeat: 'no-repeat',
          WebkitMaskSize: '100% 100%',
          maskSize: '100% 100%',
        }}
      />
    </div>
  );
}
