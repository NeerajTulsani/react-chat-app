import React, { useState } from 'react';
import './App.css';

const api = {
  createChat: (name) => Promise.resolve({ chatId: Date.now(), messages: [], name}),
  sendMessage: (chatId, message) => Promise.resolve({ user: 'You', timestamp: new Date(), content: message }),
  deleteChat: (chatId) => Promise.resolve(),
};

const Message = ({ user, timestamp, content }) => (
  <div className="message">
    <p>
      <strong>{user}</strong>:
    </p>
    <p>{content}</p>
    <t>{new Date(timestamp).toLocaleTimeString()}</t>
  </div>
);

const Chat = ({ chatId, name, messages, onSendMessage, onDeleteChat }) => {
  const [newMessage, setNewMessage] = useState('');

  const handleEnterKey = (event) => {
    if (event.key === 'Enter') {
      handleSendMessage();
    }
  };

  const handleSendMessage = async () => {
    if (newMessage.trim() === '') return;

    const sentMessage = await api.sendMessage(chatId, newMessage);
    onSendMessage(sentMessage);
    setNewMessage('');
  };

  return (
    <div className="chat">
      <div className="chat-header">
        <h3>{name}</h3>
      </div>
      <div className="messages">
        {messages.map((message, index) => (
          <Message key={index} {...message} />
        ))}
      </div>
      <div className="message-input">
        <input
          type="text"
          placeholder="Type your message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={handleEnterKey}
        />
        <button onClick={handleSendMessage}>Send</button>
      </div>
    </div>
  );
};

const DefaultChatView = () => {
  return (
    <div className='no-chat-selected'>
    No Chat Selected
    </div>
  );
};

const App = () => {
  const [chats, setChats] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [selectedChat, setSelectedChat] = useState(null);

  const handleEnterKey = async (event) => {
    if (event.key === 'Enter') {
      const newChatName = event.target.value;
      let chat = chats.filter((chat) => {
        console.log(chat);
        if (chat.name === newChatName) {
          return chat
        }
        return null
      })
      chat = chat[0]
      if (!chat) {
        chat = await createChat(newChatName);
      }
      handleChatClick(chat.chatId)
      event.target.value = '';
    }
  };

  const createChat = async (chatName) => {
    const newChat = await api.createChat(chatName);
    setChats((prevChats) => [...prevChats, newChat]);
    return newChat
  };

  const sendMessage = (chatId, message) => {
    setChats((prevChats) =>
      prevChats.map((chat) =>
        chat.chatId === chatId ? { ...chat, messages: [...chat.messages, message] } : chat
      )
    );
  };

  const deleteChat = async (chatId) => {
    await api.deleteChat(chatId);
    setChats((prevChats) => prevChats.filter((chat) => chat.chatId !== chatId));
    setActiveChat(null);
  };

  const handleChatClick = (chatId) => {
    setActiveChat(chatId);
    setSelectedChat(chatId);
  };

  return (
    <div className="App">
      <div className="chat-list">
      <h1 className='app-name'>Chat Application</h1>
      <input className="input-box" type="text" id="search" placeholder="Enter name to start chat" onKeyDown={handleEnterKey} />
        {chats.map((chat) => (
          <div key={chat.chatId} className={`chat-list-item ${selectedChat === chat.chatId ? 'selected-chat' : ''}`} onClick={() => handleChatClick(chat.chatId)}>
            {chat.name}
            <button onClick={() => deleteChat(chat.chatId)}>Delete</button>
          </div>
        ))}
      </div>
      <div className="chat">
        {activeChat === null && <DefaultChatView />}
        {activeChat !== null && (
          <Chat
            key={activeChat}
            {...chats.filter((chat) => {
              if (chat.chatId === activeChat) {
                return chat.name
              }
              return ''
            })}
            {...chats.find((chat) => chat.chatId === activeChat)}
            onSendMessage={(message) => sendMessage(activeChat, message)}
            onDeleteChat={() => deleteChat(activeChat)}
          />
        )}
      </div>
    </div>
  );
};

export default App;
