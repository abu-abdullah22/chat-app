import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { NewChatDialog } from '@/components/chat/NewChatDialog';
import { useAuth } from '@/contexts/AuthContext';
import { searchUsers, startConversation } from '@/lib/api';

jest.mock('@/contexts/AuthContext');
jest.mock('@/lib/api');

const mockUseAuth = useAuth as jest.Mock;
const mockSearchUsers = searchUsers as jest.Mock;
const mockStartConversation = startConversation as jest.Mock;

describe('NewChatDialog', () => {
  const mockToken = 'mock-token';
  const mockCurrentUser = { _id: 'user-1', name: 'Current User', phone: '+123' };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAuth.mockReturnValue({
      token: mockToken,
      user: mockCurrentUser,
    });
  });

  it('renders correctly when open', () => {
    render(<NewChatDialog open={true} onOpenChange={jest.fn()} onConversationStart={jest.fn()} />);
    expect(screen.getByPlaceholderText('Search users...')).toBeInTheDocument();
  });

  it('shows empty state when query is empty', () => {
    render(<NewChatDialog open={true} onOpenChange={jest.fn()} onConversationStart={jest.fn()} />);
    expect(screen.getByText('Type a name to search for users...')).toBeInTheDocument();
  });

  it('capitalizes search query and shows results', async () => {
    const mockUsers = [
      { _id: 'user-2', name: 'Alice', phone: '+456' },
    ];
    mockSearchUsers.mockResolvedValue(mockUsers);

    render(<NewChatDialog open={true} onOpenChange={jest.fn()} onConversationStart={jest.fn()} />);
    
    const input = screen.getByPlaceholderText('Search users...');
    fireEvent.change(input, { target: { value: 'alice' } });

    await waitFor(() => {
      // The API should be called with capitalized 'Alice'
      expect(mockSearchUsers).toHaveBeenCalledWith('Alice', mockToken);
      expect(screen.getByText('Alice')).toBeInTheDocument();
    });
  });

  it('starts conversation and closes dialog when a user is clicked', async () => {
    const mockUsers = [{ _id: 'user-2', name: 'Alice', phone: '+456' }];
    mockSearchUsers.mockResolvedValue(mockUsers);
    
    const mockConversation = { _id: 'conv-1', type: 'direct', participants: ['user-2'] };
    mockStartConversation.mockResolvedValue(mockConversation);
    
    const onConversationStart = jest.fn();
    const onOpenChange = jest.fn();

    render(<NewChatDialog open={true} onOpenChange={onOpenChange} onConversationStart={onConversationStart} />);
    
    fireEvent.change(screen.getByPlaceholderText('Search users...'), { target: { value: 'Alice' } });

    await waitFor(() => {
      expect(screen.getByText('Alice')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Alice'));

    await waitFor(() => {
      expect(mockStartConversation).toHaveBeenCalledWith('user-2', mockToken);
      expect(onConversationStart).toHaveBeenCalledWith({ ...mockConversation, participant: mockUsers[0] });
      expect(onOpenChange).toHaveBeenCalledWith(false);
    });
  });
});
