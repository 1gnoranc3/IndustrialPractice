import React from 'react';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
}

const SearchInput: React.FC<SearchInputProps> = ({ value, onChange }) => (
  <input
    type="text"
    placeholder="Поиск по ФИО, номеру или названию группы"
    value={value}
    onChange={e => onChange(e.target.value)}
    style={{ width: '100%', marginBottom: 16, padding: 8, fontSize: 16 }}
  />
);

export default SearchInput;

