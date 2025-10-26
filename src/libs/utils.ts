import { User } from './types'

export function isUser(user: User | null) {
  if (user && user.name) return true;
  return false;
}

// for conditional render of Editing
export function canEdit(user: User | null) {
  // if (user && (user.roles.includes('admin'))) return true;
  // return false;

  // todo: change before deployment
  return true;
}