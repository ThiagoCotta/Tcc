import { useState, useEffect, useRef } from 'react';
import { Check, ChevronsUpDown, Loader2, X, Cpu, Monitor, HardDrive, MemoryStick } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { QuickSearchItem } from '@/services/quick-search-api';

interface AllHardwareSelectProps {
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  items: QuickSearchItem[];
  loading?: boolean;
}

// Mapear tipos para ícones
const getTypeIcon = (type: string) => {
  switch (type) {
    case 'CPU':
      return <Cpu className="w-4 h-4" />;
    case 'GPU':
      return <Monitor className="w-4 h-4" />;
    case 'Motherboard':
      return <HardDrive className="w-4 h-4" />;
    case 'RAM':
      return <MemoryStick className="w-4 h-4" />;
    default:
      return <Cpu className="w-4 h-4" />;
  }
};

// Mapear tipos para cores
const getTypeColor = (type: string) => {
  const colors: Record<string, string> = {
    'CPU': 'bg-blue-500/10 text-blue-600 border-blue-500/20',
    'GPU': 'bg-green-500/10 text-green-600 border-green-500/20',
    'RAM': 'bg-purple-500/10 text-purple-600 border-purple-500/20',
    'Motherboard': 'bg-orange-500/10 text-orange-600 border-orange-500/20',
    'Storage': 'bg-gray-500/10 text-gray-600 border-gray-500/20'
  };
  return colors[type] || 'bg-gray-500/10 text-gray-600 border-gray-500/20';
};

export function AllHardwareSelect({
  placeholder,
  value,
  onChange,
  disabled = false,
  items,
  loading = false
}: AllHardwareSelectProps) {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Filtrar itens com base no termo de busca
  const filteredItems = searchTerm.trim() === ''
    ? items
    : items.filter(item => 
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.brand && item.brand.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.model && item.model.toLowerCase().includes(searchTerm.toLowerCase()))
      );

  // Agrupar itens por tipo
  const groupedItems = filteredItems.reduce((acc, item) => {
    if (!acc[item.type]) {
      acc[item.type] = [];
    }
    acc[item.type].push(item);
    return acc;
  }, {} as Record<string, QuickSearchItem[]>);

  // Limpar a seleção
  const handleClear = () => {
    onChange('');
    setSearchTerm('');
  };

  // Encontrar o item selecionado
  const selectedItem = items.find(item => item.name === value);

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
              // Não precisa carregar dados aqui, pois são passados como props
            }}
          >
            {value ? (
              <div className="flex items-center gap-2 truncate">
                {selectedItem && getTypeIcon(selectedItem.type)}
                <span className="truncate">{value}</span>
                {selectedItem && (
                  <Badge className={`${getTypeColor(selectedItem.type)} border text-xs`}>
                    {selectedItem.type}
                  </Badge>
                )}
              </div>
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
      
      <PopoverContent className="p-0 w-full min-w-[400px] max-w-[600px]" align="start">
        <Command>
          <CommandInput 
            placeholder="Buscar hardware por nome, marca, modelo ou tipo..." 
            value={searchTerm}
            onValueChange={setSearchTerm}
          />
          
          {loading && (
            <div className="flex items-center justify-center p-4">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <span className="ml-2 text-sm text-muted-foreground">Carregando catálogo...</span>
            </div>
          )}
          
          {!loading && (
            <CommandList className="max-h-[400px]">
              {filteredItems.length === 0 ? (
                <CommandEmpty>Nenhum hardware encontrado.</CommandEmpty>
              ) : (
                Object.entries(groupedItems).map(([type, typeItems]) => (
                  <CommandGroup key={type} heading={type}>
                    {typeItems.map((item) => (
                      <CommandItem
                        key={`${item.type}-${item.name}`}
                        value={item.name}
                        onSelect={(currentValue) => {
                          onChange(currentValue);
                          setOpen(false);
                        }}
                        className="flex items-center gap-3 p-3"
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            value === item.name ? "opacity-100" : "opacity-0"
                          )}
                        />
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          {getTypeIcon(item.type)}
                          <div className="flex-1 min-w-0">
                            <div className="font-medium truncate">{item.name}</div>
                            {(item.brand || item.model) && (
                              <div className="text-xs text-muted-foreground truncate">
                                {item.brand && item.model ? `${item.brand} - ${item.model}` : item.brand || item.model}
                              </div>
                            )}
                          </div>
                          <Badge className={`${getTypeColor(item.type)} border text-xs`}>
                            {item.type}
                          </Badge>
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                ))
              )}
            </CommandList>
          )}
        </Command>
      </PopoverContent>
    </Popover>
  );
}
