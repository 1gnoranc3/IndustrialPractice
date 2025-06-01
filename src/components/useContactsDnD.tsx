import React from 'react';
import { useEffect, useMemo, useState, useCallback } from 'react';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Group, Contact } from '../types/contacts';

// Обёртываем компоненты в React.memo вне хука, чтобы сохранить типы пропсов
const MemoSortableGroup = React.memo(function MemoSortableGroup(props: any) {
  return <props.Component {...props} />;
});
const MemoSortableContact = React.memo(function MemoSortableContact(props: any) {
  return <props.Component {...props} />;
});

export function useContactsDnD({
  data,
  groupView,
  canSort,
  renderContact,
  checkAccess,
  Spinner,
  isGroup,
  collectGroupedContactIds,
  collectAllContacts,
  SortableGroup,
  SortableContact
}: any) {
  // Мемоизация групп и независимых контактов
  const groups = useMemo(() => data.filter(isGroup) as Group[], [data, isGroup]);
  const groupedIds = useMemo(() => collectGroupedContactIds(groups), [groups, collectGroupedContactIds]);
  const independentContacts = useMemo(
    () => data.filter((item: any) => !isGroup(item) && !groupedIds.has((item as Contact).id)) as Contact[],
    [data, isGroup, groupedIds]
  );
  const rootItems = useMemo(() => [...groups, ...independentContacts], [groups, independentContacts]);

  // Порядок
  const STORAGE_KEY = 'contacts_root_order_v1';
  const [rootOrder, setRootOrderState] = useState<string[]>(() => {
    const saved = typeof window !== 'undefined' ? window.localStorage.getItem(STORAGE_KEY) : null;
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return groups.map(g => g.id);
      }
    }
    return groups.map(g => g.id);
  });

  // Сохраняем rootOrder в localStorage при изменении
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(rootOrder));
    }
  }, [rootOrder]);

  // Обновляем rootOrder при изменении данных (например, если появились новые группы/контакты)
  useEffect(() => {
    const allIds = rootItems.map(i => i.id);
    // Только если реально есть новые id
    if (allIds.length > rootOrder.length || allIds.some((id, idx) => rootOrder[idx] !== id)) {
      const newOrder = [...rootOrder];
      allIds.forEach(id => {
        if (!newOrder.includes(id)) newOrder.push(id);
      });
      if (newOrder.length !== rootOrder.length) {
        setRootOrderState(newOrder);
      }
    }
    // eslint-disable-next-line
  }, [rootItems, rootOrder]);

  // При изменении данных (например, после полной перезагрузки) если rootOrder пустой, инициализируем его
  useEffect(() => {
    const groupIds = groups.map(g => g.id);
    if (rootOrder.length === 0 && groupIds.length > 0) {
      setRootOrderState(groupIds);
    }
  }, [groups, rootOrder]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  // Мемоизация orderedItems для предотвращения лишних рендеров
  const orderedItems = useMemo(() =>
    rootOrder
      .map(id => groups.find(g => g.id === id) || independentContacts.find(c => c.id === id))
      .filter(Boolean) as (Group | Contact)[],
    [rootOrder, groups, independentContacts]
  );

  const renderContactMemo = useCallback(renderContact, [renderContact]);

  // flatContacts и flatOrder всегда объявляются, но используются только если !groupView
  const STORAGE_KEY_FLAT = 'contacts_flat_order_v1';
  const flatContacts = useMemo(() => collectAllContacts(data), [data, collectAllContacts]);
  const [flatOrder, setFlatOrder] = useState<string[]>(() => {
    const saved = typeof window !== 'undefined' ? window.localStorage.getItem(STORAGE_KEY_FLAT) : null;
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return flatContacts.map((c: Contact) => c.id);
      }
    }
    return flatContacts.map((c: Contact) => c.id);
  });
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEY_FLAT, JSON.stringify(flatOrder));
    }
  }, [flatOrder]);
  useEffect(() => {
    const allIds = flatContacts.map((c: Contact) => c.id);
    if (allIds.length > flatOrder.length || allIds.some((id: string, idx: number) => flatOrder[idx] !== id)) {
      const newOrder = [...flatOrder];
      allIds.forEach((id: string) => {
        if (!newOrder.includes(id)) newOrder.push(id);
      });
      if (newOrder.length !== flatOrder.length) {
        setFlatOrder(newOrder);
      }
    }
  }, [flatContacts, flatOrder]);
  useEffect(() => {
    if (flatOrder.length === 0 && flatContacts.length > 0) {
      setFlatOrder(flatContacts.map((c: Contact) => c.id));
    }
  }, [flatContacts, flatOrder]);

  let content: React.ReactNode = null;
  if (!data.length) content = <div className="error-message">Нет данных</div>;
  else if (groupView) {
    content = (
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={e => {
          const { active, over } = e;
          if (!over) return;
          // Определяем тип элемента
          const isActiveGroup = groups.some(g => g.id === active.id);
          const isOverGroup = groups.some(g => g.id === over.id);
          const isActiveContact = independentContacts.some(c => c.id === active.id);
          const isOverContact = independentContacts.some(c => c.id === over.id);
          // Группы можно менять только с группами, контакты только с контактами
          if (isActiveGroup && isOverGroup) {
            const onlyGroups = rootOrder.filter(id => groups.some(g => g.id === id));
            const newOrder = arrayMove(onlyGroups, onlyGroups.indexOf(active.id as string), onlyGroups.indexOf(over.id as string));
            const result = rootOrder.map(id => (onlyGroups.includes(id) ? newOrder.shift()! : id));
            setRootOrderState(result);
          } else if (isActiveContact && isOverContact) {
            const onlyContacts = rootOrder.filter(id => independentContacts.some(c => c.id === id));
            const newOrder = arrayMove(onlyContacts, onlyContacts.indexOf(active.id as string), onlyContacts.indexOf(over.id as string));
            const result = rootOrder.map(id => (onlyContacts.includes(id) ? newOrder.shift()! : id));
            setRootOrderState(result);
          }
        }}
      >
        <SortableContext items={rootOrder} strategy={verticalListSortingStrategy}>
          {orderedItems.map(item =>
            isGroup(item) ? (
              <MemoSortableGroup
                key={item.id}
                Component={SortableGroup}
                group={item}
                renderContact={renderContactMemo}
                disabled={!canSort}
                level={0}
              />
            ) : null
          )}
        </SortableContext>
        {/* Контакты без группы: отдельный SortableContext для независимых контактов */}
        {independentContacts.length > 0 && (
          <div style={{ marginTop: 24 }}>
            <div style={{ fontWeight: 500, marginBottom: 8, color: '#888' }}>Без группы</div>
            <SortableContext items={rootOrder.filter(id => independentContacts.some(c => c.id === id))} strategy={verticalListSortingStrategy}>
              {orderedItems.filter(item => !isGroup(item)).map(item => (
                <MemoSortableContact
                  key={item.id}
                  Component={SortableContact}
                  contact={item as Contact}
                  renderContact={renderContactMemo}
                  disabled={!canSort}
                />
              ))}
            </SortableContext>
          </div>
        )}
      </DndContext>
    );
  } else {
    content = (
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={e => {
          const { active, over } = e;
          if (!over) return;
          const newOrder = arrayMove(flatOrder, flatOrder.indexOf(active.id as string), flatOrder.indexOf(over.id as string));
          setFlatOrder(newOrder);
        }}
      >
        <SortableContext items={flatOrder} strategy={verticalListSortingStrategy}>
          {flatOrder.map((id: string) => {
            const contact = flatContacts.find((c: Contact) => c.id === id);
            return contact ? (
              <MemoSortableContact
                key={contact.id}
                Component={SortableContact}
                contact={contact}
                renderContact={renderContactMemo}
                disabled={!canSort}
              />
            ) : null;
          })}
        </SortableContext>
      </DndContext>
    );
  }

  return { content };
}

