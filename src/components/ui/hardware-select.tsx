import { useState, useEffect, useRef } from 'react';
import { Check, ChevronsUpDown, Loader2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { fetchHardwareList, HardwareListItem } from '@/services/hardware-api';

interface HardwareSelectProps {
  hardwareType: 'cpu' | 'gpu' | 'motherboard' | 'ram';
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export function HardwareSelect({
  hardwareType,
  placeholder,
  value,
  onChange,
  disabled = false
}: HardwareSelectProps) {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<HardwareListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const initialLoadRef = useRef(false);

  // Carregar dados quando o componente for montado ou quando o tipo de hardware mudar
  useEffect(() => {
    if (!initialLoadRef.current) {
      loadHardwareData();
      initialLoadRef.current = true;
    }
  }, [hardwareType]);

  const loadHardwareData = async () => {
    if (loading) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const data = await fetchHardwareList(hardwareType);
      setItems(data);
    } catch (err) {
      console.error('Erro ao carregar dados:', err);
      setError('Falha ao carregar opções. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  // Filtrar itens com base no termo de busca
  const filteredItems = searchTerm.trim() === ''
    ? items
    : items.filter(item => 
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
      );

  // Limpar a seleção
  const handleClear = () => {
    onChange('');
    setSearchTerm('');
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <div className="relative">
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between bg-input/50 border-border focus:border-primary transition-colors h-10"
            disabled={disabled}
            onClick={() => {
              if (items.length === 0 && !loading && !error) {
                loadHardwareData();
              }
            }}
          >
            {value ? (
              <span className="truncate">{value}</span>
            ) : (
              <span className="text-muted-foreground">{placeholder}</span>
            )}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        
        {value && !disabled && (
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-8 top-0 h-full px-2 py-0 hover:bg-transparent"
            onClick={(e) => {
              e.stopPropagation();
              handleClear();
            }}
          >
            <X className="h-4 w-4 text-muted-foreground" />
          </Button>
        )}
      </div>
      
      <PopoverContent className="p-0 w-full min-w-[300px]" align="start">
        <Command>
          <CommandInput 
            placeholder={`Buscar ${placeholder.toLowerCase()}...`} 
            value={searchTerm}
            onValueChange={setSearchTerm}
          />
          
          {loading && (
            <div className="flex items-center justify-center p-4">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <span className="ml-2 text-sm text-muted-foreground">Carregando...</span>
            </div>
          )}
          
          {error && (
            <div className="p-4 text-center">
              <p className="text-sm text-destructive">{error}</p>
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-2"
                onClick={() => loadHardwareData()}
              >
                Tentar novamente
              </Button>
            </div>
          )}
          
          {!loading && !error && (
            <CommandList>
              {filteredItems.length === 0 ? (
                <CommandEmpty>Nenhum resultado encontrado.</CommandEmpty>
              ) : (
                <CommandGroup>
                  {filteredItems.map((item) => (
                    <CommandItem
                      key={item.name}
                      value={item.name}
                      onSelect={(currentValue) => {
                        onChange(currentValue);
                        setOpen(false);
                      }}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          value === item.name ? "opacity-100" : "opacity-0"
                        )}
                      />
                      <span className="truncate">{item.name}</span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
            </CommandList>
          )}
        </Command>
      </PopoverContent>
    </Popover>
  );
}