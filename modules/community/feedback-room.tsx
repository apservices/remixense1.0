// modules/community/feedback-room.tsx

import React, { useState } from "react";

export function FeedbackRoom() {
  const [comments, setComments] = useState<string[]>([]);
  const [input, setInput] = useState("");

  const handleSubmit = () => {
    setComments([...comments, input]);
    setInput("");
  };

  return (
    <div>
      <h3>Sala de Feedback</h3>
      <textarea value={input} onChange={(e) => setInput(e.target.value)} />
      <button onClick={handleSubmit}>Enviar</button>
      <ul>
        {comments.map((c, i) => <li key={i}>{c}</li>)}
      </ul>
    </div>
  );
}