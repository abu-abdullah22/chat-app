const BASE_URL = 'https://frontend-task-chatapp.onrender.com/api';

export async function loginApi(phone: string, name: string) {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone, name }),
  });
  
  if (!res.ok) {
    let errorMsg = 'Failed to login';
    try {
      const errorData = await res.json();
      errorMsg = errorData.error?.message || errorMsg;
    } catch {
      // Ignore JSON parse error if response is not JSON
    }
    throw new Error(errorMsg);
  }
  
  return res.json();
}

export interface User {
  _id: string;
  name: string;
  phone: string;
}

export interface Conversation {
  _id: string;
  isGroup: boolean;
  name?: string;
  participants: User[];
  createdAt?: string;
  updatedAt?: string;
}

export async function searchUsers(query: string, token: string): Promise<User[]> {
  const res = await fetch(`${BASE_URL}/users/search?q=${encodeURIComponent(query)}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error('Failed to search users');
  }

  return res.json();
}

export async function startConversation(userId: string, token: string): Promise<Conversation> {
  const res = await fetch(`${BASE_URL}/conversations`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ userId }),
  });

  if (!res.ok) {
    throw new Error('Failed to start conversation');
  }

  return res.json();
}
