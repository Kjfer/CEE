import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Trash2 } from 'lucide-react';

const DAYS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

export interface ScheduleBlock {
  days: string[];
  startTime: string;
  endTime: string;
}

interface ScheduleBuilderProps {
  value: string;
  onChange: (value: string) => void;
}

export function ScheduleBuilder({ value, onChange }: ScheduleBuilderProps) {
  const [blocks, setBlocks] = useState<ScheduleBlock[]>(() => {
    if (!value) return [{ days: [], startTime: '', endTime: '' }];
    try {
      return value.split(' | ').map(part => {
        const match = part.match(/^(.*?) \((.*?)-(.*?)\)$/);
        if (match) {
          return {
            days: match[1].split(', ').map(d => d.trim()),
            startTime: match[2].trim(),
            endTime: match[3].trim()
          };
        }
        throw new Error();
      });
    } catch {
      return [{ days: [], startTime: '', endTime: '' }];
    }
  });

  const updateParent = (newBlocks: ScheduleBlock[]) => {
    const formatted = newBlocks
      .filter(b => b.days.length > 0 && b.startTime && b.endTime)
      .map(b => `${b.days.join(', ')} (${b.startTime}-${b.endTime})`)
      .join(' | ');
    onChange(formatted);
  };

  const addBlock = () => {
    const newBlocks = [...blocks, { days: [], startTime: '', endTime: '' }];
    setBlocks(newBlocks);
    updateParent(newBlocks);
  };

  const removeBlock = (index: number) => {
    const newBlocks = blocks.filter((_, i) => i !== index);
    setBlocks(newBlocks);
    updateParent(newBlocks);
  };

  const updateBlock = (index: number, field: keyof ScheduleBlock, val: any) => {
    const newBlocks = [...blocks];
    newBlocks[index] = { ...newBlocks[index], [field]: val };
    setBlocks(newBlocks);
    updateParent(newBlocks);
  };

  const toggleDay = (index: number, day: string) => {
    const block = blocks[index];
    const newDays = block.days.includes(day)
      ? block.days.filter(d => d !== day)
      : [...block.days, day];
    
    newDays.sort((a, b) => DAYS.indexOf(a) - DAYS.indexOf(b));
    updateBlock(index, 'days', newDays);
  };

  return (
    <div className="grid gap-3 border rounded-lg p-4 bg-muted/10">
      {blocks.map((block, idx) => (
        <div key={idx} className="relative rounded-md border p-3 bg-white shadow-sm">
          {blocks.length > 1 && (
            <button
              type="button"
              onClick={() => removeBlock(idx)}
              className="absolute top-2 right-2 text-muted-foreground hover:text-destructive"
              title="Eliminar este horario"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
          
          <div className="mb-3">
            <Label className="text-xs mb-2 block">Días de la semana</Label>
            <div className="flex flex-wrap gap-x-4 gap-y-2">
              {DAYS.map(day => {
                const isSelectedInOtherBlock = blocks.some((b, i) => i !== idx && b.days.includes(day));
                return (
                  <label 
                    key={day} 
                    className={`flex items-center gap-1.5 text-sm select-none ${isSelectedInOtherBlock ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                    title={isSelectedInOtherBlock ? 'Día ya seleccionado en otro horario' : ''}
                  >
                    <input
                      type="checkbox"
                      checked={block.days.includes(day)}
                      disabled={isSelectedInOtherBlock}
                      onChange={() => toggleDay(idx, day)}
                      className="h-3.5 w-3.5 rounded border-gray-300 text-primary focus:ring-primary disabled:cursor-not-allowed"
                    />
                    {day}
                  </label>
                );
              })}
            </div>
          </div>
          
          <div className="flex flex-col gap-1.5">
            <div className="flex gap-4 items-end">
              <div className="grid gap-1.5 flex-1 max-w-[150px]">
                <Label className="text-xs">Hora de inicio</Label>
                <Input
                  type="time"
                  value={block.startTime}
                  onChange={(e) => updateBlock(idx, 'startTime', e.target.value)}
                  className="h-8"
                />
              </div>
              <div className="grid gap-1.5 flex-1 max-w-[150px]">
                <Label className="text-xs">Hora de fin</Label>
                <Input
                  type="time"
                  value={block.endTime}
                  onChange={(e) => updateBlock(idx, 'endTime', e.target.value)}
                  className="h-8"
                />
              </div>
            </div>
            {block.startTime && block.endTime && block.startTime >= block.endTime && (
              <p className="text-xs text-destructive">La hora de inicio debe ser menor a la de fin.</p>
            )}
          </div>
        </div>
      ))}

      <div className="flex items-center justify-between gap-4">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addBlock}
          className="h-8 border-dashed"
        >
          <Plus className="h-4 w-4 mr-2" />
          Añadir otro horario
        </Button>
        <p className="text-xs text-muted-foreground text-right">
          Formato generado: <span className="font-semibold text-foreground">{value || 'Vacio'}</span>
        </p>
      </div>
    </div>
  );
}
