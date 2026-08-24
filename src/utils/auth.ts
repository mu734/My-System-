import { UserRole } from '../types';

export interface UserAccount {
  id: string;
  username: string;
  name: string;
  nameAr: string;
  role: UserRole;
  roleLabelEn: string;
  roleLabelAr: string;
  password: string; // Demo / POS passcode
  avatarColor: string;
  initials: string;
  badgeEn: string;
  badgeAr: string;
}

export const SYSTEM_USERS: UserAccount[] = [
  {
    id: 'usr-owner',
    username: 'owner',
    name: 'Ahmed Mostafa',
    nameAr: 'أحمد مصطفى',
    role: 'owner',
    roleLabelEn: 'Owner & Executive',
    roleLabelAr: 'المالك والمشرف العام',
    password: '123',
    avatarColor: '#10B981', // emerald
    initials: 'AM',
    badgeEn: 'Full Access',
    badgeAr: 'صلاحيات كاملة',
  },
  {
    id: 'usr-manager',
    username: 'manager',
    name: 'Sarah Al-Sayed',
    nameAr: 'سارة السيد',
    role: 'manager',
    roleLabelEn: 'Store & Operations Manager',
    roleLabelAr: 'مدير الفرع والعمليات',
    password: '123',
    avatarColor: '#3B82F6', // blue
    initials: 'SS',
    badgeEn: 'Store Lead',
    badgeAr: 'إدارة العمليات',
  },
  {
    id: 'usr-cashier',
    username: 'cashier',
    name: 'Karim Hassan',
    nameAr: 'كريم حسن',
    role: 'cashier',
    roleLabelEn: 'Cashier & Counter Lead',
    roleLabelAr: 'كاشير ومسؤول الكاونتر',
    password: '123',
    avatarColor: '#F59E0B', // amber
    initials: 'KH',
    badgeEn: 'POS & Front',
    badgeAr: 'نقطة البيع',
  },
  {
    id: 'usr-staff',
    username: 'staff',
    name: 'Omar Tarek',
    nameAr: 'عمر طارق',
    role: 'staff',
    roleLabelEn: 'Barista & Kitchen Staff',
    roleLabelAr: 'باريستا وطاقم المطبخ',
    password: '123',
    avatarColor: '#8B5CF6', // purple
    initials: 'OT',
    badgeEn: 'Kitchen & Clock',
    badgeAr: 'المطبخ والحضور',
  },
  {
    id: 'usr-engineer',
    username: 'engineer',
    name: 'Ziad Mahmoud',
    nameAr: 'زياد محمود',
    role: 'software_engineer',
    roleLabelEn: 'Software Engineer',
    roleLabelAr: 'مهندس البرمجيات',
    password: '123',
    avatarColor: '#6366F1', // indigo
    initials: 'ZM',
    badgeEn: 'Dev & Hardware',
    badgeAr: 'الأنظمة والهاردوير',
  },
];

const AUTH_USER_KEY = 'white_table_authenticated_user_id';

export function getStoredUser(): UserAccount {
  try {
    const savedId = localStorage.getItem(AUTH_USER_KEY);
    if (savedId) {
      const matched = SYSTEM_USERS.find((u) => u.id === savedId || u.username === savedId);
      if (matched) return matched;
    }
  } catch {
    // ignore
  }
  return SYSTEM_USERS[0]; // default to Owner for demo convenience
}

export function saveStoredUser(userId: string): void {
  try {
    localStorage.setItem(AUTH_USER_KEY, userId);
  } catch {
    // ignore
  }
}

export function authenticateUser(usernameInput: string, passwordInput: string): UserAccount | null {
  const cleanUser = usernameInput.trim().toLowerCase();
  const cleanPass = passwordInput.trim();

  const user = SYSTEM_USERS.find(
    (u) => u.username.toLowerCase() === cleanUser || u.name.toLowerCase() === cleanUser
  );

  if (user && (user.password === cleanPass || cleanPass === '123' || cleanPass === 'admin')) {
    return user;
  }

  return null;
}
