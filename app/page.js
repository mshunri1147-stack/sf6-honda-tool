'use client';

import { useState, useEffect } from "react";
import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, onSnapshot, updateDoc, doc, setDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
};

let db;
if (typeof window !== "undefined") {
  const app = initializeApp(firebaseConfig);
  db = getFirestore(app);
}

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

  useEffect(() => {
    if (!db) return;
    const unsub = onSnapshot(collection(db, "rooms", room, "combos"), (snapshot) => {
      setCombos(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsub();
  }, [room]);

  useEffect(() => {
    if (!db) return;
    const unsub = onSnapshot(collection(db, "rooms", room, "characters"), (snapshot) => {
      setCharacters(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsub();
  }, [room]);

  const addCombo = async () => {
    if (!db || !starter || !combo) return;
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
    if (!db) return;
    const ref = doc(db, "rooms", room, "combos", id);
    await updateDoc(ref, { favorite: !current });
  };

  const saveCharacter = async () => {
    if (!db || !selectedChar) return;
    await setDoc(doc(db, "rooms", room, "characters", selectedChar), {
      content: charText,
    });
  };

  const loadCharacter = (char) => {
    setSelectedChar(char.id);
    setCharText(char.content || "");
  };

  const filtered = combos.filter((c) => 
    c.starter?.includes(search) || c.combo?.includes(search)
  );

  return (
    <div className="p-4 max-w-md mx-auto bg-black text-white min-h-screen">
      <h1 className="text-2xl font-bold mb-4 text-center">本田ツール（共有）</h1>

      <div className="flex mb-4 gap-2">
        <button onClick={() => setTab("combo")} className={`flex-1 p-3 rounded ${tab === "combo" ? "bg-blue-600" : "bg-gray-800"}`}>
          コンボ
        </button>
        <button onClick={() => setTab("char")} className={`flex-1 p-3 rounded ${tab === "char" ? "bg-blue-600" : "bg-gray-800"}`}>
          キャラ対
        </button>
      </div>

      {tab === "combo" && (
        <>
          <input placeholder="検索..." className="w-full p-3 mb-3 bg-gray-900 border border-gray-700 rounded" value={search} onChange={(e) => setSearch(e.target.value)} />
          <div className="space-y-2 mb-6">
            <input placeholder="始動技" className="w-full p-3 bg-gray-900 border border-gray-700 rounded" value={starter} onChange={(e) => setStarter(e.target.value)} />
            <input placeholder="コンボ" className="w-full p-3 bg-gray-900 border border-gray-700 rounded" value={combo} onChange={(e) => setCombo(e.target.value)} />
            <input placeholder="ダメージ" className="w-full p-3 bg-gray-900 border border-gray-700 rounded" value={damage} onChange={(e) => setDamage(e.target.value)} />
            <button onClick={addCombo} className="w-full bg-blue-600 p-3 rounded font-bold">コンボ追加</button>
          </div>

          <div className="space-y-3">
            {filtered.map((c) => (
              <div key={c.id} className="border border-gray-700 p-4 rounded bg-gray-950 flex justify-between">
                <div>
                  <div className="font-bold">{c.starter}</div>
                  <div>{c.combo}</div>
                  <div className="text-orange-400">💥 {c.damage}</div>
                </div>
                <button onClick={() => toggleFav(c.id, c.favorite)} className="text-2xl">
                  {c.favorite ? "⭐" : "☆"}
                </button>
              </div>
            ))}
          </div>
        </>
      )}

      {tab === "char" && (
        <>
          <div className="mb-6">
            <input placeholder="キャラ名（例：ケン）" className="w-full p-3 mb-2 bg-gray-900 border border-gray-700 rounded" value={selectedChar} onChange={(e) => setSelectedChar(e.target.value)} />
            <textarea placeholder="キャラ対メモ" className="w-full p-3 h-40 bg-gray-900 border border-gray-700 rounded" value={charText} onChange={(e) => setCharText(e.target.value)} />
            <button onClick={saveCharacter} className="w-full bg-green-600 p-3 rounded font-bold mt-2">保存する</button>
          </div>
          <div className="space-y-2">
            {characters.map((char) => (
              <div key={char.id} onClick={() => loadCharacter(char)} className="border border-gray-700 p-4 rounded bg-gray-950 cursor-pointer">
                {char.id}
              </div>
            ))}
          </div>
        </>
      )}

      <div className="mt-8 text-center text-xs text-gray-500">
        ?room=名前 で共有できるで〜
      </div>
    </div>
  );
}