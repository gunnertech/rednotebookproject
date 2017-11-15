import { Input } from './input.model';
import { User } from './user.model';

export class Response {
	_id: string;
  value: any;
  input: Input | any;
  user: User | any;
  isEncrypted: boolean;
  decryptedValue: any;
}