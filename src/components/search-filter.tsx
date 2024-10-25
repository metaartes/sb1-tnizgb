import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Check, X } from 'lucide-react';

interface FilterOption {
  value: string;
  label: string;
}

interface SearchFilterProps {
  onSearch: (searchTerm: string, filters: string[]) => void;
  filters: FilterOption[];
}

export function SearchFilter({ onSearch, filters }: SearchFilterProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilters, setActiveFilters] = useState<string[]>([]);

  const handleSearch = () => {
    onSearch(searchTerm, activeFilters);
  };

  const toggleFilter = (filter: string) => {
    setActiveFilters(prev =>
      prev.includes(filter)
        ? prev.filter(f => f !== filter)
        : [...prev, filter]
    );
  };

  return (
    <div className="flex items-center space-x-2">
      <Input
        placeholder="Buscar..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="max-w-sm"
      />
      {filters.map((filter) => (
        <Button
          key={filter.value}
          variant={activeFilters.includes(filter.value) ? "default" : "outline"}
          onClick={() => toggleFilter(filter.value)}
        >
          {filter.label}
          {activeFilters.includes(filter.value) ? (
            <Check className="ml-2 h-4 w-4" />
          ) : (
            <X className="ml-2 h-4 w-4" />
          )}
        </Button>
      ))}
      <Button onClick={handleSearch}>Buscar</Button>
    </div>
  );
}