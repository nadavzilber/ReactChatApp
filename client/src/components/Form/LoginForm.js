import React from 'react';
import '../../styles.css';


const LoginForm = ({ onLogin, nickname, setNickname, onKeyPressed, selectRoom }) => {
    const validateName = (input) => {
        if (input.length < 30)
            setNickname(input)
    }
    return <div>
        <form onSubmit={onLogin}>
            <input
                value={nickname}
                onChange={(e) => validateName(e.target.value)}
                onKeyDown={(e) => onKeyPressed(e, 'sign-in')}
                placeholder="Enter your nickname..."
                className="TextArea" />
            <div className="selection-container">
                <label>Select a chat room</label>
                <select id="dropdown" className="room-select" defaultValue="General" onChange={(e) => selectRoom(e.target.value)}>
                    <option value="General">General</option>
                    <option value="Dev">Dev</option>
                    <option value="Marketing">Marketing</option>
                </select>
            </div>
            <button className="submit-button">Start chatting</button>
        </form>
    </div>
}
export default LoginForm;