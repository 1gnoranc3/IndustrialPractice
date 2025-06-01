export interface FiltersSectionProps {
  contactType: 'all' | 'local' | 'network';
  onContactTypeChange: (type: 'all' | 'local' | 'network') => void;
  messaging: 'all' | 'allowed' | 'forbidden';
  onMessagingChange: (val: 'all' | 'allowed' | 'forbidden') => void;
  groupView: boolean;
  onGroupViewChange: (val: boolean) => void;
}

