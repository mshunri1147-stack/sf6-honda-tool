'use client';

import { useState, useEffect } from "react";
import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, onSnapshot, updateDoc, doc, setDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  // storageBucket, messagingSenderId, appId も必要ならここに追加してな
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export default function SF6HondaTool() {
  const [tab, setTab] = useState("combo");
  const [combos, setCombos] = useState([]);
  const [starter, setStarter] = useState("");
  const [combo, setCombo] = useState("");
  const [damage, setDamage] = useState("");
  const [search, setSearch] = useState("");

  const [characters, setCharacters] = useState([]);
  const [selectedChar, setSelectedChar] = useState("");
  const [charText, setCharText] = useState("");

  const params = new URLSearchParams(typeof window !== "undefined" ? window.location.search : "");
  const room = params.get("room") || "default";

  // コンボ同期
  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, "rooms", room, "combos"),
      (snapshot) => {
        setCombos(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      }
    );
    return () => unsub();
  }, [room]);

  // キャラ対一覧
  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, "rooms", room, "characters"),
      (snapshot) => {
        setCharacters(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      }
    );
    return () => unsub();
  }, [room]);

  const addCombo = async () => {
    if (!starter || !combo) return;
    await addDoc(collection(db, "rooms", room, "combos"), {
      starter,
      combo,
      damage,
      favorite: false,
    });
    setStarter("");
    setCombo("");
    setDamage("");
  };

  const toggleFav = async (id, current) => {
    const ref = doc(db, "rooms", room, "combos", id);
    await updateDoc(ref, { favorite: !current });
  };

  const saveCharacter = async () => {
    if (!selectedChar) return;
    await setDoc(doc(db, "rooms", room, "characters", selectedChar), {
      content: charText,
    });
  };

  const loadCharacter = (char) => {
    setSelectedChar(char.id);
    setCharText(char.content || "");
  };

  const filtered = combos.filter(
    (c) => c.starter?.includes(search) || c.combo?.includes(search)
  );

  return (
    <div className="p-4 max-w-md mx-auto bg-black text-white min-h-screen">
      <h1 className="text-2xl font-bold mb-4 text-center">本田ツール（共有）</h1>

      <div className="flex mb-4 gap-2">
        <button
          onClick={() => setTab("combo")}
          className={`flex-1 p-3 rounded ${tab === "combo" ? "bg-blue-600 text-white" : "bg-gray-800"}`}
        >
          コンボ
        </button>
        <button
          onClick={() => setTab("char")}
          className={`flex-1 p-3 rounded ${tab === "char" ? "bg-blue-600 text-white" : "bg-gray-800"}`}
        >
          キャラ対
        </button>
      </div>

      {tab === "combo" && (
        <>
          <input
            placeholder="検索..."
            className="w-full p-3 mb-3 bg-gray-900 border border-gray-700 rounded text-white"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <div className="space-y-2 mb-6">
            <input
              placeholder="始動技"
              className="w-full p-3 bg-gray-900 border border-gray-700 rounded text-white"
              value={starter}
              onChange={(e) => setStarter(e.target.value)}
            />
            <input
              placeholder="コンボ"
              className="w-full p-3 bg-gray-900 border border-gray-700 rounded text-white"
              value={combo}
              onChange={(e) => setCombo(e.target.value)}
            />
            <input
              placeholder="ダメージ"
              className="w-full p-3 bg-gray-900 border border-gray-700 rounded text-white"
              value={damage}
              onChange={(e) => setDamage(e.target.value)}
            />
            <button
              onClick={addCombo}
              className="w-full bg-blue-600 hover:bg-blue-700 p-3 rounded font-bold"
            >
              コンボ追加
            </button>
          </div>

          <div className="space-y-3">
            {filtered.map((c) => (
              <div key={c.id} className="border border-gray-700 p-4 rounded bg-gray-950 flex justify-between items-start">
                <div>
                  <div className="font-bold text-lg">{c.starter}</div>
                  <div className="text-gray-300">{c.combo}</div>
                  <div className="text