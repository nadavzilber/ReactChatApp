import React, { useState, useEffect, useRef } from 'react';
import '../../styles.css';

/* TODO:  ✔️ 
1-
*/

const ChatForm = ({ sendMessage, message, handleChange, onKeyPressed }) => {
    return <form onSubmit={(e) => sendMessage(e, { type: "chat-msg" })}>
        <textarea
            value={message}
            onChange={handleChange}
            onKeyDown={(e) => onKeyPressed(e, 'send-msg')}
            placeholder="Say something..."
            className="new-message-input-field" />
        <button className="submit-button">Send</button>
    </form>
}
export default ChatForm;