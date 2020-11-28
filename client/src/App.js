import React, { useState, useEffect, useRef } from 'react';
import './styles.css';
import io from "socket.io-client";
import Message from './components/Message/Message';
import LoginForm from './components/Form/LoginForm';
import ChatForm from './components/Form/ChatForm';
//import scrollToBottom from './assets/scrollToBottom.png';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowAltCircleDown } from '@fortawesome/free-solid-svg-icons'

/* TODO: 
1- add nickname instead of id ✔️
2- add sender name/id to msgs ✔️
3- add rooms ✔️
4- add system msgs (x has entered) ✔️
5- msg should have header and body and timestamp ✔️
6- export repeating elements to components ✔️
*/

const App = () => {
  const msgRef = useRef(null);
  const [yourID, setYourID] = useState();
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [isLogged, setLogged] = useState(false);
  const [nickname, setNickname] = useState("");
  const [room, selectRoom] = useState("General");

  const socketRef = useRef();

  useEffect(() => {
    socketRef.current = io.connect('/');

    socketRef.current.on("your-id", id => {
      setYourID(id);
    });

    socketRef.current.on("server-message", (message) => {
      receivedMessage(message);
    });

    socketRef.current.on("login", status => {
      setLogged(status)
    });
  }, []);

  function receivedMessage(message) {
    setMessages(oldMsgs => [...oldMsgs, message]);
  }

  function sendMessage(event, data) {
    if (!!event) event.preventDefault();
    let messageObject;
    if (data.type === "chat-msg")
      messageObject = {
        room,
        body: message,
        id: yourID,
        name: nickname
      };
    else if (data.type === "system-msg")
      messageObject = {
        room,
        body: data.message,
        id: "System",
        name: "System"
      };
    setMessage("");
    socketRef.current.emit("client-message", messageObject);
  }

  const executeScroll = () => {
    console.log('scroll')
    msgRef.current.scrollIntoView();
  }

  function handleChange(e) {
    setMessage(e.target.value);
  }

  const onKeyPressed = (event, funcName) => {
    if (event.keyCode === 13) { //ENTER 
      if (funcName === "send-msg")
        sendMessage(event, { type: "chat-msg" });
      else if (funcName === "sign-in")
        onLogin(event);
    }
  }

  const onLogin = (event) => {
    event.preventDefault();
    if (nickname.trim().length > 0) {
      const data = { nickname, room };
      socketRef.current.emit("client-action", data);
    }
    else setNickname("");
  }
  return (
    <div className="chat-room-container">
      {!isLogged && <LoginForm
        onLogin={onLogin}
        nickname={nickname}
        setNickname={setNickname}
        onKeyPressed={onKeyPressed}
        selectRoom={selectRoom} />}
      {isLogged && <>
        <div className="messages-container">
          <div className="messages-list">
            {messages.map((message, index) => {
              return <Message
                key={index}
                type={message.id}
                isMe={message.id === yourID}
                sender={message.name}
                body={message.body}
                time={message.time}
              />
            })}
            <div className="messages-footer" ref={msgRef}></div>
          </div>
        </div>
        <ChatForm
          sendMessage={sendMessage}
          message={message}
          handleChange={handleChange}
          onKeyPressed={onKeyPressed} />
      </>}
      <div className="my-id">
        <FontAwesomeIcon className="scroll-down" icon={faArrowAltCircleDown} onClick={executeScroll} />
        <label style={{ "margin-right": "20px" }}>{nickname}</label>
        <label>{yourID}</label>
      </div>
    </div>
  );
};

export default App;