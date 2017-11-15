import { Section } from './section.model';

export class Input {
	_id: string;
  label: string;
  placeholder: string;
  description: string;
  dataType: string;
  choices: string;
  documentUrl: string;
  allowMultipleChoiceSelections: boolean;
  repeatable: boolean;
  requiresEncryption: boolean;
  position: number;
  section: Section | any;
  sectionId: string;
  master: Input;
  children: Input[];
  responseValue: any;
}