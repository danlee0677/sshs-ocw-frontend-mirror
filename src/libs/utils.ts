import { useNavigate } from 'react-router';
import { User } from './types'

export function isUser(user: User | null) {
  if (user && user.name) return true;
  return false;
}