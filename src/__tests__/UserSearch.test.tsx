import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { UserSearch } from '@/components/chat/UserSearch';
import { useAuth } from '@/contexts/AuthContext';
import { searchUsers, startConversation } from '@/lib/api';

// Mock dependencies
jest.mock('@/contexts/AuthContext');
jest.mock('@/lib/api');
jest.mock('@/hooks/useDebounce', () => ({
  useDebounce: (value: string) => value, // instantly return value for tests
}));

const mockUseAuth = useAuth as jest.Mock;
const mockSearchUsers = searchUsers as jest.Mock;
const mockStartConversation = startConversation as jest.Mock;

describe('UserSearch', () => {
  const mockToken = 'mock-token';
  const mockCurrentUser = { _id: 'user-1', name: 'Current User', phone: '+123' };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAuth.mockReturnValue({
      user: mockCurrentUser,
      token: mockToken,
    });
  });

  it('renders initial empty state', () => {
    render(<UserSearch onConversationStart={jest.fn()} />);
    expect(screen.getByPlaceholderText('Search users to start chatting...')).toBeInTheDocument();
  });

  it('shows loading state and results on successful search', async () => {
    const mockUsers = [
      { _id: 'user-2', name: 'Alice', phone: '+456' },
      { _id: 'user-3', name: 'Bob', phone: '+789' },
    ];
    
    // Create a delayed promise to test loading state
    let resolveSearch!: (value: unknown) => void;
    const searchPromise = new Promise((resolve) => {
      resolveSearch = resolve;
    });
    mockSearchUsers.mockReturnValue(searchPromise);

    render(<UserSearch onConversationStart={jest.fn()} />);
    
    const input = screen.getByPlaceholderText('Search users to start chatting...');
    fireEvent.change(input, { target: { value: 'a' } });

    // The loading spinner should be visible (using lucide-react Loader2 class)
    expect(document.querySelector('.animate-spin')).toBeInTheDocument();

    // Resolve the API call
    resolveSearch(mockUsers);

    // Wait for results to appear
    await waitFor(() => {
      expect(screen.getByText('Alice')).toBeInTheDocument();
      expect(screen.getByText('Bob')).toBeInTheDocument();
    });

    // Loading should be gone
    expect(document.querySelector('.animate-spin')).not.toBeInTheDocument();
  });

  it('filters out current user from search results', async () => {
    const mockUsers = [
      mockCurrentUser, // Should be filtered out
      { _id: 'user-2', name: 'Alice', phone: '+456' },
    ];
    mockSearchUsers.mockResolvedValue(mockUsers);

    render(<UserSearch onConversationStart={jest.fn()} />);
    
    fireEvent.change(screen.getByPlaceholderText('Search users to start chatting...'), { target: { value: 'a' } });

    await waitFor(() => {
      expect(screen.getByText('Alice')).toBeInTheDocument();
    });
    
    expect(screen.queryByText('Current User')).not.toBeInTheDocument();
  });

  it('shows empty state when no results found', async () => {
    mockSearchUsers.mockResolvedValue([]);

    render(<UserSearch onConversationStart={jest.fn()} />);
    
    fireEvent.change(screen.getByPlaceholderText('Search users to start chatting...'), { target: { value: 'notfound' } });

    await waitFor(() => {
      expect(screen.getByText(/No users found matching "notfound"/i)).toBeInTheDocument();
    });
  });

  it('shows error state when search fails', async () => {
    mockSearchUsers.mockRejectedValue(new Error('Network error'));

    render(<UserSearch onConversationStart={jest.fn()} />);
    
    fireEvent.change(screen.getByPlaceholderText('Search users to start chatting...'), { target: { value: 'a' } });

    await waitFor(() => {
      expect(screen.getByText('Network error')).toBeInTheDocument();
    });
  });

  it('starts conversation when a user is clicked', async () => {
    const mockUsers = [{ _id: 'user-2', name: 'Alice', phone: '+456' }];
    mockSearchUsers.mockResolvedValue(mockUsers);
    
    const mockConversation = { _id: 'conv-1', isGroup: false, participants: mockUsers };
    mockStartConversation.mockResolvedValue(mockConversation);
    
    const onConversationStart = jest.fn();

    render(<UserSearch onConversationStart={onConversationStart} />);
    
    fireEvent.change(screen.getByPlaceholderText('Search users to start chatting...'), { target: { value: 'a' } });

    await waitFor(() => {
      expect(screen.getByText('Alice')).toBeInTheDocument();
    });

    // Click the user
    fireEvent.click(screen.getByText('Alice'));

    await waitFor(() => {
      expect(mockStartConversation).toHaveBeenCalledWith('user-2', mockToken);
      expect(onConversationStart).toHaveBeenCalledWith(mockConversation);
    });

    // Search input should be cleared
    expect(screen.getByPlaceholderText('Search users to start chatting...')).toHaveValue('');
  });
});
