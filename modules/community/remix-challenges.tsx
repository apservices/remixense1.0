// modules/community/remix-challenges.tsx

import React, { useState } from "react";
import { ChallengeType } from "./challenge-types";

export function RemixChallenges() {
  const [challenges] = useState([
    { id: 1, title: "Remixar com vocal do mês", type: ChallengeType.Vocal },
    { id: 2, title: "Mashup harmônico", type: ChallengeType.Harmonic },
  ]);

  return (
    <div>
      <h3>Desafios de Remix</h3>
      <ul>
        {challenges.map((c) => <li key={c.id}>{c.title}</li>)}
      </ul>
    </div>
  );
}