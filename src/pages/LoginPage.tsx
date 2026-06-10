// src/pages/Login.jsx
import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import { useNavigate } from "react-router-dom";

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const nav = useNavigate();

    const handleLogin = async () => {
        try {
            await signInWithEmailAndPassword(auth, email, password);
            nav("/");
        } catch (e) {
            setError(e.message);
        }
    };

    return (
        <div>
            <h2>로그인</h2>
            <input type="email" placeholder="이메일" value={email}
                onChange={(e) => setEmail(e.target.value)} />
            <input type="password" placeholder="비밀번호" value={password}
                onChange={(e) => setPassword(e.target.value)} />
            {error && <p>{error}</p>}
            <button onClick={handleLogin}>로그인</button>
            <p onClick={() => nav("/signup")}>계정이 없으신가요? 회원가입</p>
        </div>
    );
}