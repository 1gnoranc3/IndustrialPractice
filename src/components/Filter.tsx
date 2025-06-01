import React from 'react';
import { FiltersSectionProps } from './filtersSection.types';

const FiltersSection: React.FC<FiltersSectionProps> = ({
  contactType,
  onContactTypeChange,
  messaging,
  onMessagingChange,
  groupView,
  onGroupViewChange,
}) => {
  return (
    <section className="filters-section">
      <h2 className="filters-title">Контакты</h2>
      <div className="filters-row">
        <div className="contactType">
          <label htmlFor="contactType">Тип контактов/групп</label>
          <select
            id="contactType"
            name="contactType"
            value={contactType}
            onChange={e => onContactTypeChange(e.target.value as any)}
          >
            <option value="all">Все</option>
            <option value="local">Локальные</option>
            <option value="network">Сетевые</option>
          </select>
        </div>
        <div className="messaging">
          <label htmlFor="messaging">Обмен сообщениями</label>
          <select
            id="messaging"
            name="messaging"
            value={messaging}
            onChange={e => onMessagingChange(e.target.value as any)}
          >
            <option value="all">Все</option>
            <option value="forbidden">Запрещен</option>
            <option value="allowed">Разрешен</option>
          </select>
        </div>
        <div className="groupView">
          <label htmlFor="groupView">Отображение группами</label>
          <img
            className="group-checkbox-img"
            src={groupView ? '/assets/images/group_checkbox_on.svg' : '/assets/images/group_checkbox_off.svg'}
            alt={groupView ? 'Включено' : 'Выключено'}
            onClick={() => onGroupViewChange(!groupView)}
            style={{ cursor: 'pointer' }}
          />
        </div>
      </div>
    </section>
  );
};

export default FiltersSection;
