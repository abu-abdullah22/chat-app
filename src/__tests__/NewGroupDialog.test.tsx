import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { NewGroupDialog } from '@/components/chat/NewGroupDialog';
import { useAuth } from '@/contexts/AuthContext';
import { searchUsers, createGroupConversation } from '@/lib/api';

jest.mock('@/contexts/AuthContext');
jest.mock('@/lib/api');

const mockUseAuth = useAuth as jest.Mock;
const mockSearchUsers = searchUsers as jest.Mock;
const mockCreateGroupConversation = createGroupConversation as jest.Mock;

describe('NewGroupDialog', () => {
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
    render(<NewGroupDialog open={true} onOpenChange={jest.fn()} onConversationStart={jest.fn()} />);
    expect(screen.getByPlaceholderText('Group Name')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Search users to add...')).toBeInTheDocument();
  });

  it('allows adding and removing users from the group', async () => {
    const mockUsers = [
      { _id: 'user-2', name: 'Alice', phone: '+456' },
    ];
    mockSearchUsers.mockResolvedValue(mockUsers);

    render(<NewGroupDialog open={true} onOpenChange={jest.fn()} onConversationStart={jest.fn()} />);
    
    // Search for Alice
    fireEvent.change(screen.getByPlaceholderText('Search users to add...'), { target: { value: 'alice' } });

    await waitFor(() => {
      expect(screen.getByText('Alice')).toBeInTheDocument();
    });

    // Click Alice to add to group
    fireEvent.click(screen.getByText('Alice'));

    // The name "Alice" should appear in the selected chips (first name only)
    await waitFor(() => {
      expect(screen.getAllByText('Alice').length).toBeGreaterThan(1);
    });

    // The Create Group button should still be disabled because there's no group name
    const createButton = screen.getByRole('button', { name: /Create Group/i });
    expect(createButton).toBeDisabled();
    
    // Add group name
    fireEvent.change(screen.getByPlaceholderText('Group Name'), { target: { value: 'My Group' } });
    
    // Create button should now be enabled
    expect(createButton).not.toBeDisabled();
  });

  it('calls API to create group and closes on success', async () => {
    const mockUsers = [{ _id: 'user-2', name: 'Alice', phone: '+456' }];
    mockSearchUsers.mockResolvedValue(mockUsers);
    
    const mockConversation = { _id: 'conv-1', type: 'group', name: 'My Group', participants: ['user-2'] };
    mockCreateGroupConversation.mockResolvedValue(mockConversation);
    
    const onConversationStart = jest.fn();
    const onOpenChange = jest.fn();

    render(<NewGroupDialog open={true} onOpenChange={onOpenChange} onConversationStart={onConversationStart} />);
    
    // Add User
    fireEvent.change(screen.getByPlaceholderText('Search users to add...'), { target: { value: 'Alice' } });
    await waitFor(() => expect(screen.getByText('Alice')).toBeInTheDocument());
    fireEvent.click(screen.getByText('Alice'));
    
    // Add Name
    fireEvent.change(screen.getByPlaceholderText('Group Name'), { target: { value: 'My Group' } });
    
    // Create
    fireEvent.click(screen.getByRole('button', { name: /Create Group/i }));

    await waitFor(() => {
      expect(mockCreateGroupConversation).toHaveBeenCalledWith('My Group', ['user-2'], mockToken);
      expect(onConversationStart).toHaveBeenCalledWith(mockConversation);
      expect(onOpenChange).toHaveBeenCalledWith(false);
    });
  });
});
