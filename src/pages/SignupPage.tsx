// src/pages/Signup.jsx
import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import { useNavigate } from "react-router-dom";

export default function Signup() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const nav = useNavigate();

    const handleSignup = async () => {
        try {
            await createUserWithEmailAndPassword(auth, email, password);
            nav("/");
        } catch (e) {
            setError(e.message);
        }
    };

    return (
        <div>
            <h2>회원가입</h2>
            <input type="email" placeholder="이메일" value={email}
                onChange={(e) => setEmail(e.target.value)} />
            <input type="password" placeholder="비밀번호" value={password}
                onChange={(e) => setPassword(e.target.value)} />
            {error && <p>{error}</p>}
            <button onClick={handleSignup}>가입하기</button>
            <p onClick={() => nav("/login")}>이미 계정이 있으신가요? 로그인</p>
        </div>
    );
}