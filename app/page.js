// SF6 Honda Combo Tool - Shared + Character Matchup (Firebase)

import { useState, useEffect } from "react"; import { initializeApp } from "firebase/app"; import { getFirestore, collection, addDoc, onSnapshot, updateDoc, doc, setDoc, } from "firebase/firestore";

const firebaseConfig = { apiKey: "YOUR_API_KEY", authDomain: "YOUR_PROJECT.firebaseapp.com", projectId: "YOUR_PROJECT_ID", };

const app = initializeApp(firebaseConfig); const db = getFirestore(app);

export default function App() { const [tab, setTab] = useState("combo"); const [combos, setCombos] = useState([]); const [starter, setStarter] = useState(""); const [combo, setCombo] = useState(""); const [damage, setDamage] = useState(""); const [search, setSearch] = useState("");

const [characters, setCharacters] = useState([]); const [selectedChar, setSelectedChar] = useState(""); const [charText, setCharText] = useState("");

const params = new URLSearchParams(window.location.search); const room = params.get("room") || "default";

// コンボ同期 useEffect(() => { const unsub = onSnapshot( collection(db, "rooms", room, "combos"), (snapshot) => { setCombos( snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) ); } ); return () => unsub(); }, [room]);

// キャラ対一覧 useEffect(() => { const unsub = onSnapshot( collection(db, "rooms", room, "characters"), (snapshot) => { const list = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data(), })); setCharacters(list); } ); return () => unsub(); }, [room]);

const addCombo = async () => { if (!starter || !combo) return; await addDoc(collection(db, "rooms", room, "combos"), { starter, combo, damage, favorite: false, }); setStarter(""); setCombo(""); setDamage(""); };

const toggleFav = async (id, current) => { const ref = doc(db, "rooms", room, "combos", id); await updateDoc(ref, { favorite: !current }); };

const saveCharacter = async () => { if (!selectedChar) return; await setDoc(doc(db, "rooms", room, "characters", selectedChar), { content: charText, }); };

const loadCharacter = (char) => { setSelectedChar(char.id); setCharText(char.content || ""); };

const filtered = combos.filter( (c) => c.starter?.includes(search) || c.combo?.includes(search) );

return ( <div className="p-4 max-w-md mx-auto"> <h1 className="text-xl font-bold mb-2">本田ツール（共有）</h1>

<div className="flex mb-2 gap-2">
    <button
      onClick={() => setTab("combo")}
      className={`flex-1 p-2 rounded ${tab === "combo" ? "bg-blue-500 text-white" : "border"}`}
    >
      コンボ
    </button>
    <button
      onClick={() => setTab("char")}
      className={`flex-1 p-2 rounded ${tab === "char" ? "bg-blue-500 text-white" : "border"}`}
    >
      キャラ対
    </button>
  </div>

  {tab === "combo" && (
    <>
      <input
        placeholder="検索..."
        className="w-full p-2 mb-2 border rounded"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <div className="mb-4">
        <input
          placeholder="始動技"
          className="w-full p-2 mb-1 border rounded"
          value={starter}
          onChange={(e) => setStarter(e.target.value)}
        />
        <input
          placeholder="コンボ"
          className="w-full p-2 mb-1 border rounded"
          value={combo}
          onChange={(e) => setCombo(e.target.value)}
        />
        <input
          placeholder="ダメージ"
          className="w-full p-2 mb-1 border rounded"
          value={damage}
          onChange={(e) => setDamage(e.target.value)}
        />
        <button
          onClick={addCombo}
          className="w-full bg-blue-500 text-white p-2 rounded"
        >
          追加
        </button>
      </div>

      {filtered.map((c) => (
        <div
          key={c.id}
          className="border p-2 mb-2 rounded flex justify-between"
        >
          <div>
            <div className="font-bold">{c.starter}</div>
            <div>{c.combo}</div>
            <div>💥 {c.damage}</div>
          </div>
          <button onClick={() => toggleFav(c.id, c.favorite)}>
            {c.favorite ? "⭐" : "☆"}
          </button>
        </div>
      ))}
    </>
  )}

  {tab === "char" && (
    <>
      <div className="mb-2">
        <input
          placeholder="キャラ名入力（例：ケン）"
          className="w-full p-2 border rounded mb-1"
          value={selectedChar}
          onChange={(e) => setSelectedChar(e.target.value)}
        />
        <textarea
          placeholder="キャラ対メモ"
          className="w-full p-2 border rounded h-32"
          value={charText}
          onChange={(e) => setCharText(e.target.value)}
        />
        <button
          onClick={saveCharacter}
          className="w-full bg-green-500 text-white p-2 rounded mt-1"
        >
          保存
        </button>
      </div>

      <div>
        {characters.map((char) => (
          <div
            key={char.id}
            className="border p-2 mb-2 rounded"
            onClick={() => loadCharacter(char)}
          >
            {char.id}
          </div>
        ))}
      </div>
    </>
  )}

  <div className="mt-4 text-xs text-gray-500">
    URL共有で全員編集可能：?room={room}
  </div>
</div>

); }
