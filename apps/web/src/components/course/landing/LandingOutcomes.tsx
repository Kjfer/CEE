import { SectionHeading } from './SectionHeading';

interface LandingOutcomesProps {
  items: string[];
}

/** "Lo que lograrás" — derivado de course.benefits. */
export function LandingOutcomes({ items }: LandingOutcomesProps) {
  if (items.length === 0) return null;

  return (
    <div>
      <SectionHeading
        eyebrow="Lo que lograrás"
        title="Al finalizar este programa serás capaz de:"
      />
      <div className="mt-8 space-y-4">
        {items.map((item, index) => (
          <div
            key={item}
            className="flex items-start gap-4 rounded-xl border-l-4 border-cee-red bg-gradient-to-r from-cee-red/5 to-transparent p-5"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-cee-red font-bold text-white shadow-sm">
              {index + 1}
            </div>
            <p className="pt-1.5 font-medium text-foreground">{item}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
