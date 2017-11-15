import { State } from './state.model';
import { Assignment } from './assignment.model';
import { Notification } from './notification.model';
import { Response } from './response.model';

export class User {
	_id: string;
  completedAt: Date;
  local: any;
  billingInfo: any;
  states: State[];
  assignments: Assignment[];
  responses: Response[];
  notifications: Notification[];
  role: string;
  newPassword: string;
  state: State;
  hasValidSubscription: boolean;

  isAdmin() : boolean {
  	return this.role == 'admin';
  }
}