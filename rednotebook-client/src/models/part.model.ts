import { Notebook } from './notebook.model';
import { Document } from './document.model';

export class Part {
	_id: string;
  title: string;
  position: number;
  notebook: Notebook | string;
  documents: Document[];
}