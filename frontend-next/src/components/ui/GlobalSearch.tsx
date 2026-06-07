'use client';

import { useState, useRef, useEffect } from 'react';
import { Search, ChevronDown, Users, Calendar } from 'lucide-react';
import { useSearch } from '@/hooks/search';

export function GlobalSearch() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<'pacientes' | 'agendamentos'>('pacientes');
  const [inputValue, setInputValue] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { performSearch, clearSearch } = useSearch();

  const searchTypes = [
    { 
      value: 'pacientes' as const, 
      label: 'Pacientes', 
      icon: Users,
      placeholder: 'Buscar pacientes por nome, tutor ou espécie...'
    },
    { 
      value: 'agendamentos' as const, 
      label: 'Agendamentos', 
      icon: Calendar,
      placeholder: 'Buscar agendamentos por pet, tutor ou veterinário...'
    },
  ];

  const currentType = searchTypes.find(type => type.value === selectedType);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      performSearch(inputValue.trim(), selectedType);
    } else {
      clearSearch();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    
    // Se o campo estiver vazio, limpar a busca
    if (!value.trim()) {
      clearSearch();
    }
  };

  const handleTypeSelect = (type: 'pacientes' | 'agendamentos') => {
    setSelectedType(type);
    setIsOpen(false);
    // Se há um termo de busca, realizar a busca com o novo tipo
    if (inputValue.trim()) {
      performSearch(inputValue.trim(), type);
    }
  };

  return (
    <div className="flex-1 max-w-md relative" ref={dropdownRef}>
      <form onSubmit={handleSearch} className="relative">
        <div className="flex">
          {/* Dropdown para selecionar tipo de busca */}
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-2 px-3 py-2 bg-muted/50 border border-r-0 rounded-l-md hover:bg-muted/70 transition-colors"
          >
            {currentType && <currentType.icon className="h-4 w-4" />}
            <span className="text-sm font-medium hidden sm:inline">{currentType?.label}</span>
            <ChevronDown className="h-3 w-3" />
          </button>

          {/* Campo de busca */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <input
              type="text"
              value={inputValue}
              onChange={handleInputChange}
              placeholder={currentType?.placeholder}
              className="w-full pl-10 pr-4 py-2 bg-muted/50 border border-l-0 rounded-r-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Dropdown menu */}
        {isOpen && (
          <div className="absolute top-full left-0 mt-1 w-64 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg z-50">
            {searchTypes.map((type) => (
              <button
                key={type.value}
                type="button"
                onClick={() => handleTypeSelect(type.value)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                  selectedType === type.value ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' : ''
                }`}
              >
                <type.icon className="h-4 w-4" />
                <div>
                  <div className="font-medium">{type.label}</div>
                  <div className="text-xs text-muted-foreground">
                    {type.value === 'pacientes' ? 'Buscar por nome, tutor ou espécie' : 'Buscar por pet, tutor ou veterinário'}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </form>
    </div>
  );
}