import { Item, Group, Contact } from '../types/contacts';

export interface FilterParams {
  contactType: 'all' | 'local' | 'network';
  messaging: 'all' | 'allowed' | 'forbidden';
  groupView: boolean;
  search: string;
}

function isGroup(item: Item): item is Group {
  return Array.isArray((item as Group).subgroups) || Array.isArray((item as Group).contacts);
}

export function filterContacts(data: Item[], params: FilterParams): Item[] | Contact[] {
  const { contactType, messaging, groupView, search } = params;

  function filterByType(item: Item): boolean {
    if (contactType === 'all') return true;
    if (isGroup(item)) {
      return contactType === 'network' ? !!item.external_id : !item.external_id;
    } else {
      return contactType === 'network' ? !!item.external_id : !item.external_id;
    }
  }

  function filterByMessaging(item: Item): boolean {
    if (messaging === 'all') return true;
    if (isGroup(item)) return true;
    if (messaging === 'allowed') return item.can_send_messages === true;
    if (messaging === 'forbidden') return item.can_send_messages === false;
    return true;
  }

  function filterBySearch(item: Item): boolean {
    if (!search) return true;
    const q = search.toLowerCase();
    if (isGroup(item)) {
      return item.name.toLowerCase().includes(q);
    } else {
      const fioFull = [item.surname, item.name, item.patronymic].filter(Boolean).join(' ').toLowerCase();
      const fioParts = fioFull.split(/\s+/);
      const phones = (item.phones || []).map(p => p.number).join(' ');
      return fioFull.includes(q) || fioParts.some(part => part.includes(q)) || phones.includes(q);
    }
  }

  function collectGroupedContactIds(items: Item[]): Set<string> {
    const ids = new Set<string>();
    function walk(item: Item) {
      if (isGroup(item)) {
        (item.contacts || []).forEach((c) => {
          ids.add(c.id);
        });
        (item.subgroups || []).forEach(walk);
      }
    }
    items.forEach(walk);
    return ids;
  }

  // Собираем все уникальные контакты из всех групп и корня
  function collectAllContacts(items: Item[]): Contact[] {
    const map = new Map<string, Contact>();
    function walk(item: Item) {
      if (isGroup(item)) {
        (item.contacts || []).forEach(walk);
        (item.subgroups || []).forEach(walk);
      } else {
        if (!map.has(item.id)) {
          map.set(item.id, item);
        }
      }
    }
    items.forEach(walk);
    return Array.from(map.values());
  }

  if (groupView) {
    // 1. Группы
    const groups = data.filter(isGroup) as Group[];
    // 2. Id всех контактов, которые входят в группы
    const groupedIds = collectGroupedContactIds(groups);
    // 3. Независимые контакты (не входят ни в одну группу)
    const independentContacts = data.filter(item => !isGroup(item) && !groupedIds.has((item as Contact).id)) as Contact[];
    // 4. Фильтрация по типу/сообщениям/поиску
    const filteredGroups = groups
      .map(item => filterGroup(item))
      .filter(Boolean) as Group[];
    const filteredIndependentContacts = independentContacts
      .filter(filterByType)
      .filter(filterByMessaging)
      .filter(filterBySearch);
    // Возвращаем группы и независимые контакты в одном массиве
    return [...filteredGroups, ...filteredIndependentContacts];
  } else {
    // Плоский список всех уникальных контактов
    return collectAllContacts(data)
      .filter(filterByType)
      .filter(filterByMessaging)
      .filter(filterBySearch);
  }

  // --- рекурсивная фильтрация групп ---
  function filterGroup(group: Group): Group | null {
    // Если группа не подходит по типу — не показываем ни её, ни её содержимое
    if (!filterByType(group)) return null;
    const contacts = (group.contacts || [])
      .filter(filterByType)
      .filter(filterByMessaging)
      .filter(filterBySearch);
    const subgroups = (group.subgroups || [])
      .map(filterGroup)
      .filter(Boolean) as Group[];
    const groupMatches = filterByType(group) && filterBySearch(group);
    if (contacts.length || subgroups.length || groupMatches) {
      return {
        ...group,
        contacts,
        subgroups
      };
    }
    return null;
  }
}
