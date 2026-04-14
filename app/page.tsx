"use client";

import { Sparkles } from "lucide-react";
import { useState } from "react";

export default function Home() {
  const userId = "1";
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const onChangeTitle = (e) => {
    return setTitle(e.target.value);
  };
  const onChangeContent = (e) => {
    return setContent(e.target.value);
  };

  const genereateQuiz = async () => {
    await fetch("/api/articles", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId,
        title,
        content,
      }),
    });
  };
  return (
    <main>
      <div className="flex gap-4">
        <Sparkles />
        <h1>Article Quiz Generator</h1>
        <input
          value={title}
          onChange={onChangeTitle}
          className="border border-red-500"
          type="text"
        />
        <input
          value={content}
          onChange={onChangeContent}
          className="border border-red-500"
          type="text"
        />
        <button onClick={genereateQuiz} className="border border-red-500">
          add
        </button>
        <p></p>
      </div>
    </main>
  );
}
