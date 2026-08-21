import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MessageInput } from '@/components/chat/MessageInput';

describe('MessageInput', () => {
  it('renders correctly', () => {
    render(<MessageInput onSendMessage={jest.fn()} />);
    expect(screen.getByPlaceholderText('Type a message...')).toBeInTheDocument();
  });

  it('calls onSendMessage when submitted with text', async () => {
    const mockOnSend = jest.fn().mockResolvedValue(undefined);
    render(<MessageInput onSendMessage={mockOnSend} />);
    
    const input = screen.getByPlaceholderText('Type a message...');
    fireEvent.change(input, { target: { value: 'Hello' } });
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    expect(mockOnSend).toHaveBeenCalledWith('Hello');
    
    await waitFor(() => {
      expect(input).toHaveValue(''); // clears on success
    });
  });

  it('does not call onSendMessage when empty', () => {
    const mockOnSend = jest.fn();
    render(<MessageInput onSendMessage={mockOnSend} />);
    
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    fireEvent.click(button);
    
    expect(mockOnSend).not.toHaveBeenCalled();
  });

  it('disables input and shows loader while sending', async () => {
    let resolveSend: () => void;
    const sendPromise = new Promise<void>(res => { resolveSend = res; });
    const mockOnSend = jest.fn().mockReturnValue(sendPromise);
    
    const { container } = render(<MessageInput onSendMessage={mockOnSend} />);
    
    const input = screen.getByPlaceholderText('Type a message...');
    fireEvent.change(input, { target: { value: 'Hello' } });
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    expect(input).toBeDisabled();
    expect(button).toBeDisabled();
    expect(container.querySelector('.animate-spin')).toBeInTheDocument();
    
    // Resolve to clean up
    resolveSend!();
    await waitFor(() => {
      expect(input).not.toBeDisabled();
    });
  });
});
