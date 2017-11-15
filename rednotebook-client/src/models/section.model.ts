import { Document } from './document.model';
import { Input } from './input.model';

export class Section {
	_id: string;
  title: string;
  description: string;
  repeatable: boolean;
  position: number;
  document: Document | any;
  documentId: string;
  master: Section;
  children: Section[];
  inputs: Input[];
  forceShow: boolean;
}