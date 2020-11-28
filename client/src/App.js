import React, { useState, useEffect, useRef } from 'react';
import './styles.css';
import io from "socket.io-client";

/* TODO: 
1- add nickname instead of id ✔️
2- add sender name/id to msgs ✔️
3- add rooms
4- add system msgs (x has entered) ✔️
5- change css - msg should have header and body
*/

const App = () => {
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
      console.log('server-message ===> ', message)
      receivedMessage(message);
    });

    socketRef.current.on("login", status => {
      console.log('on login... status:', status)
      setLogged(status)
    });
  }, []);

  function receivedMessage(message) {
    setMessages(oldMsgs => [...oldMsgs, message]);
  }

  function sendMessage(event, data) {
    console.log('sendMessage', data)
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
      //todo: instead of sending a msg i should emit a join event to the server
      //the server should process it and then send back a msg event (the one below)
      //the server should also add the socket id to the selected room 
      //and the client should set logged to true and open the chat acordingly 
      const data = { nickname, room };
      console.log('emitting client-action')
      socketRef.current.emit("client-action", data);
      //sendMessage(event, { type: "system-msg", message: `${nickname} has joined the ${room} chat room.` });
      //setLogged(true);
    }
    else setNickname("");
  }
  return (
    <div className="Page">
      <div>isLogged:{isLogged.toString()}</div>
      {!isLogged && <div>
        <form onSubmit={onLogin} className="Form">
          <input value={nickname} onChange={(e) => setNickname(e.target.value)} onKeyDown={(e) => onKeyPressed(e, 'sign-in')} placeholder="Enter your nickname..." className="TextArea" />
          <label>Select a chat room</label>
          <select id="dropdown" defaultValue="General" onChange={(e) => selectRoom(e.target.value)}>
            <option value="General">General</option>
            <option value="Dev">Dev</option>
            <option value="Marketing">Marketing</option>
          </select>
          <button className="Button">Log In</button>
        </form>
      </div>}
      {isLogged && <div className="Container">
        {messages.map((message, index) => {
          if (message.id === "System") {
            return (
              <div key={index} className="MyRow">
                <div className="MyMessage System">
                  <span className="MsgHead">{message.id}:</span>
                  <span className="MsgBody">{message.body}</span>
                </div>
              </div>
            )
          }
          else if (message.id === yourID) {
            return (
              <div key={index} className="MyRow">
                <div className="MyMessage">
                  <span className="MsgHead">{message.name}:</span>
                  <span className="MsgBody">{message.body}</span>
                </div>
              </div>
            )
          }
          return (
            <div key={index} className="PartnerRow">
              <div className="PartnerMessage">
                <span className="MsgHead">{message.name}:</span>
                <span className="MsgBody">{message.body}</span>
              </div>
            </div>
          )
        })}
      </div>}
      {isLogged && <form onSubmit={(e) => sendMessage(e, { type: "chat-msg" })} className="Form">
        <textarea value={message} onChange={handleChange} onKeyDown={(e) => onKeyPressed(e, 'send-msg')} placeholder="Say something..." className="TextArea" />
        <button className="Button">Send</button>
      </form>}
      <label className="ID">{nickname} {yourID}</label>
    </div>
  );
};

export default App;