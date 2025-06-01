import React, { useEffect, useState, useMemo } from 'react';
import { checkAccess } from '../authUtils';
import { UserData } from '../types/user';
import { useContactsDnD } from './useContactsDnD';
import { Group, Contact } from '../types/contacts';
import '../components/contacts-list.css';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';

function isGroup(item: any): item is Group {
  return (
    (Array.isArray((item as Group).subgroups) || Array.isArray((item as Group).contacts) || Array.isArray((item as Group).item_type=="Group")));
}

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0][0]?.toUpperCase() || '';
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function stringToColor(str: string) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  let color = '#';
  for (let i = 0; i < 3; i++) {
    const value = (hash >> (i * 8)) & 0xff;
    color += ('ff' + value.toString(16)).slice(-2);
  }
  return color;
}

const Spinner = () => (
  <div className="contacts-list-spinner-wrapper">
    <div className="contacts-list-spinner" />
  </div>
);

function SortableContact({ contact, renderContact, disabled }: { contact: Contact, renderContact: (c: Contact, dragHandle?: React.ReactNode, disabled?: boolean) => React.ReactNode, disabled: boolean }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: contact.id, disabled });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    cursor: disabled ? 'not-allowed' : 'grab',
  };
  const dragHandle = !disabled && (
    <span className="contacts-list-drag-handle" {...attributes} {...listeners} style={{ cursor: 'grab', marginRight: 8 }}>⋮⋮</span>
  );
  return (
    <div ref={setNodeRef} style={style} className={disabled ? 'contacts-list-disabled' : ''}>
      {renderContact(contact, dragHandle, disabled)}
    </div>
  );
}


function SortableGroup({ group, renderContact, disabled, level }: { group: Group, renderContact: (contact: Contact, dragHandle?: React.ReactNode, disabled?: boolean) => React.ReactNode, disabled: boolean, level: number }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: group.id, disabled });
  const [open, setOpen] = useState(false); // по умолчанию свернута
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    cursor: disabled ? 'not-allowed' : 'grab',
  };
  const dragHandle = !disabled && (
    <span className="contacts-list-drag-handle" {...attributes} {...listeners} style={{ cursor: 'grab', marginRight: 8 }}>⋮⋮</span>
  );
  return (
    <div ref={setNodeRef} style={style} className={disabled ? 'contacts-list-disabled' : ''}>
      <div className={`contacts-list-group${level > 0 ? ' contacts-list-group-nested' : ''}`} data-level={level}>
        <div className="contacts-list-group-header" onClick={() => setOpen((v) => !v)} style={{cursor: 'pointer'}}>
          <div className="contacts-list-group-header-left">
            {dragHandle}
            <span className={`contacts-list-group-arrow${open ? ' open' : ''}`}>▶</span>
            <span className="contacts-list-group-title">{group.name}</span>
          </div>
          <span className="contacts-list-group-type">{group.external_id ? 'Сетевой' : 'Локальный'}</span>
        </div>
        {open && (
          <div className="contacts-list-group-content">
            {(group.subgroups || []).map((subgroup) => (
              <SortableGroup
                key={subgroup.id}
                group={subgroup}
                renderContact={renderContact}
                disabled={disabled}
                level={level + 1}
              />
            ))}
            {(group.contacts || []).map((contact) => (
              <SortableContact
                key={contact.id}
                contact={contact}
                renderContact={renderContact}
                disabled={disabled}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

interface ContactsListProps {
  data: (Group | Contact)[];
  loading: boolean;
  error: string | null;
  groupView: boolean;
}

const ContactsList: React.FC<ContactsListProps & { userData: UserData }> = (props) => {
  function collectGroupedContactIds(items: (Group | Contact)[]): Set<string> {
    const ids = new Set<string>();
    function walk(item: Group | Contact) {
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

  function collectAllContacts(items: (Group | Contact)[]): Contact[] {
    const map = new Map<string, Contact>();
    function walk(item: Group | Contact) {
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

  const canSort = useMemo(() => checkAccess(props.userData), [props.userData]);

  const dnd = useContactsDnD({
    ...props,
    canSort,
    renderContact,
    checkAccess,
    Spinner,
    isGroup,
    collectGroupedContactIds,
    collectAllContacts,
    SortableGroup,
    SortableContact
  });

  function renderContact(contact: Contact, dragHandle?: React.ReactNode, disabled?: boolean) {
    const phoneNumbersList = Array.isArray(contact.phone_numbers_list)
      ? contact.phone_numbers_list.filter(num => num && typeof num === 'object' && typeof num.number === 'string')
      : [];
    const isIndependent = !('group_id' in contact) || contact.group_id == null;
    const type = contact.external_id ? 'Сетевой' : 'Локальный';
    // Приоритет мобильного телефона (tag === 'mobile'), иначе основной (is_main), иначе первый
    let displayPhone = '';
    if (phoneNumbersList.length > 0) {
      const mobile = phoneNumbersList.find(num => num.tag === 'mobile' && typeof num.number === 'string');
      const main = phoneNumbersList.find(num => num.is_main && typeof num.number === 'string');
      if (mobile) displayPhone = mobile.number;
      else if (main) displayPhone = main.number;
      else displayPhone = phoneNumbersList[0].number;
    }
    return (
      <div className={`contacts-list-contact-item${disabled ? ' contacts-list-disabled' : ''}`} key={contact.id}>
        {dragHandle}
        <div className="contacts-list-contact-avatar-wrapper">
          {contact.thumbnail ? (
            <img className="contacts-list-contact-avatar" src={contact.thumbnail} alt={contact.name} />
          ) : (
            <div
              className="contacts-list-contact-avatar-fallback"
              style={{ background: stringToColor(contact.name) }}
            >
              {getInitials(contact.name)}
            </div>
          )}
        </div>
        <div className="contacts-list-contact-info">
          <div className="contacts-list-contact-info-col">
            <span className="contacts-list-contact-name">
              {contact.surname ? `${contact.surname} ` : ''}{contact.name}{isIndependent && contact.patronymic ? ` ${contact.patronymic}` : ''}
            </span>
          </div>
          {displayPhone && (
            <span className="contacts-list-contact-phone main">
              {displayPhone}
            </span>
          )}
          <span className="contacts-list-group-type">{type}</span>
        </div>
      </div>
    );
  }

  return dnd.content;
};

export default ContactsList;

