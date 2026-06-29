import ccatLogo from '@/assets/icons/ccat-logo.png';

interface StrategicAlliancesProps {
  className?: string;
}

const ALLIANCES = [
  { name: 'CCAT', src: ccatLogo },
];

export function StrategicAlliances({ className }: StrategicAlliancesProps) {
  return (
    <div>
      <h2 className="text-center text-2xl font-bold">Alianzas Estratégicas</h2>
      <p className="mx-auto mt-4 max-w-3xl text-center text-base text-muted-foreground">
        Trabajamos en alianza con instituciones líderes para ofrecer valor adicional a nuestros programas
      </p>
      <div className={`mt-12 flex flex-wrap items-center justify-center gap-8 sm:gap-10 ${className ?? ''}`}>
        {ALLIANCES.map((alliance) => (
          <img
            key={alliance.name}
            src={alliance.src}
            alt={alliance.name}
            className="h-24 w-auto object-contain sm:h-28"
          />
        ))}
      </div>
    </div>
  );
}
