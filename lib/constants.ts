export const ALLOWED_FILE_TYPES = [
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/webp',
  'application/pdf',
  'text/plain',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
] as const

export const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10 MB
export const MAX_FILES_PER_MESSAGE = 3
