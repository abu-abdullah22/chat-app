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

export interface Message {
  _id: string;
  conversation: string;
  sender: string | User;
  text: string;
  createdAt: string;
}

export interface DirectConversation {
  _id: string;
  type?: 'direct';
  lastMessage?: Partial<Message>;
  participant?: User;
  participants?: (string | User)[];
  createdAt?: string;
  updatedAt?: string;
}

export interface GroupConversation {
  _id: string;
  type: 'group';
  name: string;
  createdBy: string;
  admins: string[];
  participants: (string | User)[];
  lastMessage?: Partial<Message>;
  createdAt?: string;
  updatedAt?: string;
}

export type Conversation = DirectConversation | GroupConversation;

export async function getConversations(token: string): Promise<Conversation[]> {
  const res = await fetch(`${BASE_URL}/conversations`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error('Failed to fetch conversations');
  }

  const result = await res.json();
  // The API returns { data: [...] } for this endpoint
  return result.data || [];
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

export const startConversation = async (userId: string, token: string): Promise<Conversation> => {
  const response = await fetch(`${BASE_URL}/conversations`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ userId }),
  });
  
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error?.message || 'Failed to start conversation');
  }
  
  const data = await response.json();
  return { ...data, type: 'direct' };
};

export const createGroupConversation = async (name: string, participantIds: string[], token: string): Promise<Conversation> => {
  const response = await fetch(`${BASE_URL}/conversations/group`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ name, participantIds }),
  });
  
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error?.message || 'Failed to create group');
  }
  
  return response.json();
};
