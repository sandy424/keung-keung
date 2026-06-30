import { useEffect, useState } from "react";
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '../firebase';
import { collection, getDocs, getDoc, doc } from 'firebase/firestore';
import Bottombar from "../components/Bottombar";
import { useNavigate } from "react-router-dom";

export default function Saved() {

    const [savedStore, setSavedStore] = useState([]);
    const [userId, setUserId] = useState(null);

    const nav = useNavigate();

    // 로그인 감지
    useEffect(() => {
        const unsub = onAuthStateChanged(auth, (user) => {
          setUserId(user ? user.uid : null);
          console.log(userId);
        });
        return() => unsub();
    }, []);

    // 찜 목록 가져오기
    useEffect(() => {
        if (!userId) {
        setSavedStore([]);
        return;
        }
        const fetchSaved = async () => {
        // 1. 찜한 shopId 목록
        const snap = await getDocs(collection(db, "users", userId, "saved"));
        const shopIds = snap.docs.map(d => d.data().shopId);

        // 2. shopId로 shops에서 전체 가게 정보 가져오기
        const stores = await Promise.all(
            shopIds.map(async (id) => {
            const shopSnap = await getDoc(doc(db, "shops", id));
            if (!shopSnap.exists()) return null;
            return { id: shopSnap.id, ...shopSnap.data() };
            })
        );

        setSavedStore(stores.filter(Boolean));
        };
        fetchSaved();
    }, [userId]);


    return(
        <div className="relative mx-auto w-full max-w-175 min-h-[calc(100vh-5rem)]">
            {!userId ? (
                <div className="pt-64 text-center">
                    <p className="text-gray-500">로그인이 필요한 서비스입니다.</p>
                </div>
            ) : (
                <div className="p-16 space-y-6">
                    <div className="text-lg font-semibold flex gap-4">
                        <p className="text-gray-700">내 찜 목록</p>
                        <p className="text-red-600">{savedStore.length}</p>
                    </div>
                    {savedStore.map((store) => (
                        <div
                            key={store.id}
                            onClick={() => nav("/detail", {state: {store}})}
                            className="flex items-center gap-3 p-4 rounded-xl shadow-sm cursor-pointer bg-white hover:bg-gray-100"
                        >
                            <span className="font-medium">{store.name}</span>
                            <span className="text-sm text-gray-500">{store.category}</span>
                        </div>
                    ))}
                </div>
            )}
            <Bottombar />
        </div>
    )
}