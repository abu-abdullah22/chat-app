import { render, screen } from '@testing-library/react';
import { MessageHistory } from '@/components/chat/MessageHistory';
import { Message } from '@/lib/api';

describe('MessageHistory', () => {
  const currentUserId = 'user-1';

  it('renders loading state', () => {
    const { container } = render(
      <MessageHistory 
        conversationId="conv-1"
        messages={[]} 
        currentUserId={currentUserId} 
        isLoading={true} 
        error={null} 
      />
    );
    expect(screen.getByText('Loading messages...')).toBeInTheDocument();
    expect(container.querySelector('.animate-spin')).toBeInTheDocument();
  });

  it('renders error state', () => {
    render(
      <MessageHistory 
        conversationId="conv-1"
        messages={[]} 
        currentUserId={currentUserId} 
        isLoading={false} 
        error="Failed to load" 
      />
    );
    expect(screen.getByText('Failed to load')).toBeInTheDocument();
  });

  it('renders empty state', () => {
    render(
      <MessageHistory 
        conversationId="conv-1"
        messages={[]} 
        currentUserId={currentUserId} 
        isLoading={false} 
        error={null} 
      />
    );
    expect(screen.getByText('No messages yet.')).toBeInTheDocument();
  });

  it('renders messages correctly', () => {
    const mockMessages: Message[] = [
      {
        _id: 'msg-1',
        conversation: 'conv-1',
        sender: 'user-1', // me
        text: 'Hello world',
        createdAt: new Date('2026-08-22T10:00:00').toISOString(),
      },
      {
        _id: 'msg-2',
        conversation: 'conv-1',
        sender: { _id: 'user-2', name: 'Alice', phone: '+123' }, // other
        text: 'Hi there',
        createdAt: new Date('2026-08-22T10:01:00').toISOString(),
      }
    ];

    render(
      <MessageHistory 
        conversationId="conv-1"
        messages={mockMessages} 
        currentUserId={currentUserId} 
        isLoading={false} 
        error={null} 
      />
    );

    expect(screen.getByText('Hello world')).toBeInTheDocument();
    expect(screen.getByText('Hi there')).toBeInTheDocument();
    expect(screen.getByText('Alice')).toBeInTheDocument(); // Shows sender name for others
  });
});
