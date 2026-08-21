import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { ConversationList } from '@/components/chat/ConversationList';
import { useAuth } from '@/contexts/AuthContext';
import { getConversations, Conversation, DirectConversation, GroupConversation } from '@/lib/api';

jest.mock('@/contexts/AuthContext');
jest.mock('@/lib/api');

const mockUseAuth = useAuth as jest.Mock;
const mockGetConversations = getConversations as jest.Mock;

describe('ConversationList', () => {
  const mockToken = 'mock-token';
  
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAuth.mockReturnValue({ token: mockToken });
  });

  it('renders loading state initially', () => {
    mockGetConversations.mockReturnValue(new Promise(() => {})); // Never resolves to keep loading state
    
    const { container } = render(
      <ConversationList 
        currentConversation={null} 
        onSelectConversation={jest.fn()} 
      />
    );
    
    // Check for the animate-spin class since lucide icons don't always render accessible roles reliably in jsdom
    expect(container.querySelector('.animate-spin')).toBeInTheDocument();
  });

  it('renders empty state when no conversations', async () => {
    mockGetConversations.mockResolvedValue([]);
    
    render(
      <ConversationList 
        currentConversation={null} 
        onSelectConversation={jest.fn()} 
      />
    );
    
    await waitFor(() => {
      expect(screen.getByText('No active conversations.')).toBeInTheDocument();
    });
  });

  it('renders error state on failure', async () => {
    mockGetConversations.mockRejectedValue(new Error('API error'));
    
    render(
      <ConversationList 
        currentConversation={null} 
        onSelectConversation={jest.fn()} 
      />
    );
    
    await waitFor(() => {
      expect(screen.getByText('API error')).toBeInTheDocument();
    });
  });

  it('renders conversations and calls onSelect on click', async () => {
    const mockConvs: Conversation[] = [
      {
        _id: 'conv-1',
        type: 'direct',
        participant: { _id: 'user-2', name: 'Alice', phone: '+123' },
        updatedAt: new Date().toISOString(),
      } as DirectConversation,
      {
        _id: 'conv-2',
        type: 'group',
        name: 'My Cool Group',
        participants: ['user-1', 'user-2'],
        admins: ['user-1'],
        createdBy: 'user-1',
        updatedAt: new Date(Date.now() - 10000).toISOString(), // older
      } as GroupConversation
    ];
    
    mockGetConversations.mockResolvedValue(mockConvs);
    const onSelect = jest.fn();
    
    render(
      <ConversationList 
        currentConversation={null} 
        onSelectConversation={onSelect} 
      />
    );
    
    await waitFor(() => {
      expect(screen.getByText('Alice')).toBeInTheDocument();
      expect(screen.getByText('My Cool Group')).toBeInTheDocument();
    });
    
    // Click on Alice
    fireEvent.click(screen.getByText('Alice'));
    
    expect(onSelect).toHaveBeenCalledWith(mockConvs[0]);
  });
});
