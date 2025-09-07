// Interface para itens de hardware
export interface HardwareListItem {
  id: string;
  name: string;
  type: 'cpu' | 'gpu' | 'motherboard' | 'ram';
}

// Interface para resposta da API
export interface HardwareApiResponse {
  items: HardwareListItem[];
}