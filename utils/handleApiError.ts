// utils/handleApiError.ts
import { notifications } from '@mantine/notifications';

export function extractErrorMessage(error: any): string {
  const data = error?.response?.data;

  if (!data) {
    return 'Something went wrong';
  }

  // Case 1: { message: "..." }
  if (typeof data.message === 'string') {
    return data.message;
  }

  // Case 2: { errors: [ { message }, ... ] }
  if (Array.isArray(data.errors)) {
    const messages = data.errors.map((e: any) => e?.message).filter(Boolean);

    if (messages.length > 0) {
      return messages.join(', ');
    }
  }

  return 'Something went wrong';
}

export function notifyApiError(error: any, title = 'Error') {
  const message = extractErrorMessage(error);

  notifications.show({
    title,
    message,
    color: 'red',
    autoClose: 3000,
  });
}
