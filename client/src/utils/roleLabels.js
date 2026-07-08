/**
 * Human-readable display names for each admin role.
 * The DB stores the snake_case key; this maps it to a UI label.
 */
export const ROLE_LABELS = {
  admin:           'General Admin',
  complaint_admin: 'Complaint Admin',
  event_admin:     'Event Admin',
  news_admin:      'News Admin',
  vacancy_admin:   'Vacancy Admin',
  superadmin:      'Super Admin',
}

/**
 * Returns the display label for a role string.
 * Falls back to the raw value if the role is unknown.
 */
export function getRoleLabel(role) {
  return ROLE_LABELS[role] ?? role
}
