export interface Phone {
  number: string;
  is_main?: boolean;
}

export interface Contact {
  id: string;
  name: string;
  patronymic?: string;
  phones: Phone[];
  thumbnail?: string;
  [key: string]: any;
}

export interface Group {
  id: string;
  name: string;
  contacts?: Contact[];
  subgroups?: Group[];
  external_id?: string;
  [key: string]: any;
}

export type Item = Group | Contact;

