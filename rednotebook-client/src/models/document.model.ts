import { Part } from './part.model';
import { State } from './state.model';
import { Assignment } from './assignment.model';
import { Section } from './section.model';

export class Document {
	_id: string;
	title: string;
	position: number;
  part: Part | any;
  partId: string;
  state: State | any;
  stateId: string;
  isOngoing: boolean;
  assignments: Assignment[];
  sections: Section[];
  sendNotification: boolean;
  assignment: Assignment;
}