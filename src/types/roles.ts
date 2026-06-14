export interface ApiRole {
  id: string;
  _id: string;
  name: string;
  description: string;
  permissions: string[];
  isSystem: boolean;
  memberCount: number;
  createdAt: string;
}

export interface TeamMember {
  id: string;
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  isActive: boolean;
  isInvited: boolean;
  roleName: string;
  roleId: string;
}

export interface PermissionDef {
  key: string;
  label: string;
}

export const ALL_PERMISSIONS: PermissionDef[] = [
  { key: 'users.view', label: 'View Users' },
  { key: 'users.manage', label: 'Manage Users' },
  { key: 'businesses.view', label: 'View Businesses' },
  { key: 'businesses.manage', label: 'Manage Businesses' },
  { key: 'billing.view', label: 'View Billing' },
  { key: 'billing.manage', label: 'Manage Billing' },
  { key: 'roles.view', label: 'View Roles' },
  { key: 'roles.manage', label: 'Manage Roles' },
  { key: 'support.view', label: 'View Support' },
  { key: 'support.manage', label: 'Manage Support' },
  { key: 'activity_logs.view', label: 'View Activity Logs' },
  { key: 'subscriptions.view', label: 'View Subscriptions' },
];
