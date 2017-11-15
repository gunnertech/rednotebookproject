import { User } from './user.model';

export class Notification {
	_id: string;
  user: User
  local: any;
  seenAt: Date;
  openedAt: Date;
  message: string;
  data: any;
}