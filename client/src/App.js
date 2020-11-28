import React, { useState, useEffect, useRef } from 'react';
import './styles.css';
import io from "socket.io-client";
import Message from './components/Message/Message';
import LoginForm from './components/Form/LoginForm';
import ChatForm from './components/Form/ChatForm';
//import scrollToBottom from './assets/scrollToBottom.png';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowAltCircleDown, faSignOutAlt } from '@fortawesome/free-solid-svg-icons'

/* TODO: 
1- add nickname instead of id ✔️
2- add sender name/id to msgs ✔️
3- add rooms ✔️
4- add system msgs (x has entered) ✔️
5- msg should have header and body and timestamp ✔️
6- export repeating elements to components ✔️
7- add "user is typing" - might be weird for multiple clients
8- add tagging others with @
9- add leave chat room button ✔️
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

    socketRef.current.on("server-message", (roomMsgs) => {
      receivedMessages(roomMsgs);
    });

    socketRef.current.on("login", status => {
      console.log(nickname,'GOT A LOGIN STATUS UPDATE:',status)
      setLogged(status)
    });
  }, []);

  function receivedMessages(roomMsgs) {
    console.log('RECEIVED roomMsgs:', roomMsgs)
    setMessages(roomMsgs);
  }

  function sendMessage(event) {
    if (!!event) event.preventDefault();

    socketRef.current.emit("client-message", {
      room,
      body: message,
      id: yourID,
      nickname
    });
    setMessage("");
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
        sendMessage(event);
      else if (funcName === "sign-in")
        onLogin(event);
    }
  }

  const onLogin = (event) => {
    event.preventDefault();
    if (nickname.trim().length > 0) {
      const data = { nickname, room, actionType: 'join-room' };
      socketRef.current.emit("client-action", data);
    }
    else setNickname("");
  }

  const leaveRoom = () => {
    const data = { nickname, room, actionType: 'leave-room' };
    socketRef.current.emit("client-action", data);
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
        <div>{room} Chat Room</div>
        <div className="messages-container">
          <div className="messages-list">
            {messages.map((message, index) => {
              return <Message
                key={index}
                type={message.id}
                isMe={message.id === yourID}
                sender={message.nickname}
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
      <div className="my-area">
        <FontAwesomeIcon className="scroll-down" icon={faArrowAltCircleDown} onClick={executeScroll} />
        <label style={{ marginRight: "20px" }}>{nickname}</label>
        <label>{yourID}</label>
        <FontAwesomeIcon className="leave-room" icon={faSignOutAlt} onClick={leaveRoom} />
      </div>
    </div>
  );
};

export default App;