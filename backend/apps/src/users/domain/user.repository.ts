import { User } from './user.entity';

export abstract class UserRepository {
  abstract findById(id: string): Promise<User | null>;
  abstract save(user: User): Promise<void>;
  abstract findAll(): Promise<User[]>;
}