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
    } catch (e) {
      // Ignore JSON parse error if response is not JSON
    }
    throw new Error(errorMsg);
  }
  
  return res.json();
}
