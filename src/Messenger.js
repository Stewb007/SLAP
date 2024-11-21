import React, { useEffect, useState } from "react";
import "./styles/Messenger.css";
import {
  createConversation,
  getConversations,
  getMessagesForConversation,
  addMessageToConversation,
  useUserSession,
} from "./firebase";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowCircleLeft, faArrowCircleRight, faArrowCircleUp, faComment, faPlusCircle, faTimesCircle } from "@fortawesome/free-solid-svg-icons";

const Messenger = () => {
  const [isMessengerOpen, setIsMessengerOpen] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [viewingConversation, setViewingConversation] = useState('');
  const { user, fetching } = useUserSession();
  const toggleMessenger = () => {
    setIsMessengerOpen(!isMessengerOpen);
  };

  useEffect(() => {
    if (!user) {
      return; // Exit early if user is not available
    }
  
    const fetchConversations = async () => {
      setLoading(true);
      const conversations = await getConversations(user.id);
      setConversations(conversations);
      setLoading(false);
    }
  
    const handleNewConversation = async (event) => {
      if (event.origin !== window.location.origin) {
        return; // Ignore messages from unknown origins for security reasons.
      }
  
      const { senderId, receiverId, initialMessage } = event.data;
  
      if (senderId && receiverId && initialMessage) {
        try {
          await createConversation({ senderId, receiverId, initialMessage });
          console.log('Conversation created successfully.');
          fetchConversations(); // Optionally re-fetch after creating a conversation
        } catch (error) {
          console.error('Error creating conversation:', error);
        }
      }
    };
  
    window.addEventListener('message', handleNewConversation);
  
    fetchConversations();
  
    return () => {
      window.removeEventListener('message', handleNewConversation);
    };
  }, [user]); // Add `user` as a dependency
  
  // fetch conversations every 15 seconds
  useEffect(() => {
    const fetchConversations = async () => {
      const newConversations = await getConversations(user.id);
      if (JSON.stringify(newConversations) !== JSON.stringify(conversations)) {
        setConversations(conversations);
      }
    }


    const interval = setInterval(() => {
      fetchConversations();
    }, 15000);
  
    return () => clearInterval(interval);
  }, [user, conversations]);
  
  const newConversationPopup = async (senderId) => {
    const popupWidth = 400;
    const popupHeight = 300;
    const popupLeft = (window.innerWidth - popupWidth) / 2;
    const popupTop = (window.innerHeight - popupHeight) / 2;

    const popupOptions = `width=${popupWidth},height=${popupHeight},top=${popupTop},left=${popupLeft},resizable=yes,scrollbars=no,status=no`;

    const popupWindow = window.open("", "newConversationPopup", popupOptions);

    if (popupWindow) {
      // Set popup window content (HTML)
      popupWindow.document.write(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <title>New Conversation</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            padding: 20px;
          }
          .input-field {
            display: block;
            margin-bottom: 15px;
            width: 100%;
            padding: 8px;
            box-sizing: border-box;
          }
          .send-button {
            padding: 10px 15px;
            background-color: #007BFF;
            color: white;
            border: none;
            cursor: pointer;
          }
          .send-button:hover {
            background-color: #0056b3;
          }
        </style>
      </head>
      <body>
        <h2>Create a New Conversation</h2>
        <input type="text" id="recipient" class="input-field" placeholder="Who do you want to talk to?" />
        <textarea id="message" class="input-field" placeholder="Enter your message here" rows="4"></textarea>
        <button id="sendButton" class="send-button">Send</button>

        <script>
          document.getElementById('sendButton').addEventListener('click', () => {
            const recipient = document.getElementById('recipient').value;
            const message = document.getElementById('message').value;

            if (recipient && message) {
              // Handle sending the message to the parent window
              console.log('Sending message to:', recipient);
              console.log('Message:', message);

              try {
                window.opener.postMessage({
                  senderId: "${senderId}",
                  receiverId: recipient,
                  initialMessage: message
                }, window.location.origin);
                
                alert('Message sent successfully!');
                window.close();
              } catch (error) {
                alert('Failed to send the message. Please try again.');
                console.error('Error posting message:', error);
              }
            } else {
              alert('Please fill in all fields.');
            }
          });
        </script>
      </body>
      </html>
    `);
    } else {
      console.error(
        "Unable to open popup window. Please allow popups in your browser."
      );
    }
  };

  if (fetching || loading) {
    return <></>;
  }

  return (
    <div>
      <div id="chat-icon" className="chat-icon" onClick={toggleMessenger}>
        <FontAwesomeIcon icon={faComment} className="chat-icon-icon" />
      </div>

      {isMessengerOpen && (
        <div id="messenger" className="messenger">
          <div id="messenger-header" className="messenger-header">
            <h3>Messenger</h3>
            <FontAwesomeIcon
              icon={faTimesCircle}
              className="messenger-close-icon"
              onClick={toggleMessenger}
            />
          </div>
          <div id="messenger-content" className="messenger-content">
            { viewingConversation !== '' 
              ? <Conversation conversation={viewingConversation} user={user} setViewingConversation={setViewingConversation} />
              :conversations.length === 0 ? (
                <p>No conversations yet</p>
                ) : <div className="conversations">
                    <h3>Conversations</h3>
                      {conversations.map((conversation) => (
                        <div
                          key={conversation.id}
                          className="conversation"
                          onClick={() => setViewingConversation(conversation)}
                        >
                          <p className="convo-img">{(conversation.names.receiver === user.name ? conversation.names.sender : conversation.names.receiver).split(" ").map(part => part[0].toUpperCase()).join("")}</p>
                          <div className="convo-info">
                            <h4>{conversation.names.receiver === user.name ? conversation.names.sender : conversation.names.receiver}</h4>
                            <p className="truncate">{conversation.messages[conversation.messages.length - 1].content}</p>
                          </div>
                          <FontAwesomeIcon icon={faArrowCircleRight} className="convo-arrow" />
                        </div>
                      ))}
                    </div>
            }
          </div>
          { viewingConversation === '' && (
                        <div id="create-conversation" className="create-conversation">
                        <button
                          className="create-conversation-button"
                          onClick={() => newConversationPopup(user.id)}
                        >
                          <FontAwesomeIcon icon={faPlusCircle} />
                        </button>
                      </div>
          )
          }
        </div>
      )}
    </div>
  );
};

function Conversation({ conversation, user, setViewingConversation }) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newMessage, setNewMessage] = useState('');

  const handleInput = (event) => {
    setNewMessage(event.target.value);
  };

  const handleSendMessage = async () => {
    if (newMessage.trim() === '') {
      return;
    }

    try {
      await addMessageToConversation(conversation.id, user.name, newMessage);
      setNewMessage('');
      setMessages([
        ...messages,
        {
          sender: user.name,
          content: newMessage,
          createdAt: new Date().toISOString(),
        },
      ]);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  }

  useEffect(() => {
    const fetchMessages = async () => {
      setLoading(true);
      const messages = await getMessagesForConversation(conversation.id);
      setMessages(messages);
      setLoading(false);
    };

    fetchMessages();
  }, [conversation]);



  if (loading) {
    return (
      <div className="message-parent">
      <div className="top-row">
        <button onClick={() => setViewingConversation('')}>
          <FontAwesomeIcon icon={faArrowCircleLeft} />
        </button>
        <p className="loading" style={{marginLeft: '0'}}></p>
      </div>
      <div id="messages" className="messages-loading">
        <div className="loader-bars"></div>
        <p>Loading conversation...</p>
      </div>
      <div id="messenger-input" className="messenger-input">
        <p className="loading" style={{height: '45px', width: '100%'}}></p>
      </div>
    </div>
    )
  }

  return (
    <div className="message-parent">
      <div className="top-row">
        <button onClick={() => setViewingConversation('')}>
          <FontAwesomeIcon icon={faArrowCircleLeft} />
        </button>
        <h3>{conversation.names.receiver === user.name ? conversation.names.sender : conversation.names.receiver}</h3>
      </div>
      <div id="messages" className="messages">
        {messages.length === 0 ? (
          <p>No messages yet</p>
        ) : (
          messages.map((message) => (
            <Message
              key={message.id}
              message={message}
              user={user}
            />
          ))
        )}
      </div>
      <div id="messenger-input" className="messenger-input">
        <input
          type="text"
          placeholder="Type a message..."
          value={newMessage}
          onChange={handleInput}
          className="messenger-input-field"
        />
        <button className="messenger-send-button" onClick={handleSendMessage}>
          <FontAwesomeIcon icon={faArrowCircleUp} />
        </button>
      </div>
    </div>
  );
}

function Message({ message, user }) {
  return (
    <div className={message.sender !== user.name ? 'message-container other' : 'message-container mine'}>
      <p className={message.sender !== user.name ? 'from-them' : 'from-me'}>{message.content}</p>
      <p className="timestamp">
        {new Date(message.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })} @&nbsp;
        {new Date(message.createdAt).toLocaleTimeString("en-US", { hour: "numeric", minute: "numeric", hour12: true })}
      </p>

    </div>
  );
}

export default Messenger;
