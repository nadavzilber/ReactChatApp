import React, { useState, useEffect, useRef } from 'react';
import './styles.css';
import io from "socket.io-client";

/* TODO: 
1- add nickname instead of id
2- add sender name/id to msgs
3- add rooms
*/

const App = () => {
  const [yourID, setYourID] = useState();
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");

  const socketRef = useRef();

  useEffect(() => {
    socketRef.current = io.connect('/');

    socketRef.current.on("your-id", id => {
      setYourID(id);
    })

    socketRef.current.on("server-message", (message) => {
      receivedMessage(message);
    })
  }, []);

  function receivedMessage(message) {
    setMessages(oldMsgs => [...oldMsgs, message]);
  }

  function sendMessage(e) {
    e.preventDefault();
    const messageObject = {
      body: message,
      id: yourID,
    };
    setMessage("");
    socketRef.current.emit("client-message", messageObject);
  }

  function handleChange(e) {
    setMessage(e.target.value);
  }

  return (
    <div className="Page">
      <div className="Container">
        {messages.map((message, index) => {
          if (message.id === yourID) {
            return (
              <div key={index} className="MyRow">
                <div className="MyMessage">
                  {message.body}
                </div>
              </div>
            )
          }
          return (
            <div key={index} className="PartnerRow">
              <div className="PartnerMessage">
                {message.body}
              </div>
            </div>
          )
        })}
      </div>
      <form onSubmit={sendMessage} className="Form">
        <textarea value={message} onChange={handleChange} placeholder="Say something..." className="TextArea" />
        <button className="Button">Send</button>
        <label className="ID">{yourID}</label>
      </form>
    </div>
  );
};

export default App;