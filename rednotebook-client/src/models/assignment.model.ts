import { Document } from './document.model';
import { User } from './user.model';

export class Assignment {
	_id: string;
  completedAt: Date;
  document: Document | any;
  user: User;
}