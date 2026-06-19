import type { SyllabusModule } from '@cee/types';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

interface SyllabusAccordionProps {
  modules: SyllabusModule[];
}

export function SyllabusAccordion({ modules }: SyllabusAccordionProps) {
  return (
    <Accordion type="single" collapsible className="w-full">
      {modules.map((module) => (
        <AccordionItem key={module.id} value={module.id}>
          <AccordionTrigger>{module.title}</AccordionTrigger>
          <AccordionContent>
            <ul className="list-disc space-y-1 pl-5 text-muted-foreground">
              {module.topics.map((topic) => (
                <li key={topic}>{topic}</li>
              ))}
            </ul>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
