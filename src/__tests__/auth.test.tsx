import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import LoginPage from '@/app/login/page';
import { AuthProvider } from '@/contexts/AuthContext';
import { loginApi } from '@/lib/api';

jest.mock('@/lib/api');
const mockedLoginApi = loginApi as jest.Mock;

const pushMock = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock }),
}));

describe('Login Page', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  it('renders login form correctly', () => {
    render(
      <AuthProvider>
        <LoginPage />
      </AuthProvider>
    );
    expect(screen.getByLabelText(/Phone Number/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Display Name/i)).toBeInTheDocument();
  });

  it('shows error on failed login', async () => {
    mockedLoginApi.mockRejectedValue(new Error('Invalid phone'));
    render(
      <AuthProvider>
        <LoginPage />
      </AuthProvider>
    );

    fireEvent.change(screen.getByLabelText(/Phone Number/i), { target: { value: '123' } });
    fireEvent.change(screen.getByLabelText(/Display Name/i), { target: { value: 'Bob' } });
    fireEvent.click(screen.getByRole('button', { name: /Continue/i }));

    await waitFor(() => {
      expect(screen.getByText(/Invalid phone/i)).toBeInTheDocument();
    });
  });

  it('redirects on successful login', async () => {
    mockedLoginApi.mockResolvedValue({ token: 'test-token', user: { _id: '1', phone: '123', name: 'Bob' } });
    render(
      <AuthProvider>
        <LoginPage />
      </AuthProvider>
    );

    fireEvent.change(screen.getByLabelText(/Phone Number/i), { target: { value: '123' } });
    fireEvent.change(screen.getByLabelText(/Display Name/i), { target: { value: 'Bob' } });
    fireEvent.click(screen.getByRole('button', { name: /Continue/i }));

    await waitFor(() => {
      expect(localStorage.getItem('token')).toBe('test-token');
      expect(pushMock).toHaveBeenCalledWith('/chat');
    });
  });
});
