import React, { useEffect, useState } from 'react';

const RemixChallenges = () => {
    const [challenges, setChallenges] = useState([]);
    const [newChallenge, setNewChallenge] = useState('');

    useEffect(() => {
        // Fetch challenges from backend (placeholder URL)
        const fetchChallenges = async () => {
            const response = await fetch('/api/remix-challenges');
            const data = await response.json();
            setChallenges(data);
        };

        fetchChallenges();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        // Submit new challenge to backend (placeholder URL)
        await fetch('/api/remix-challenges', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ challenge: newChallenge }),
        });
        setNewChallenge('');
        // Optionally refetch challenges after submission
        const response = await fetch('/api/remix-challenges');
        const data = await response.json();
        setChallenges(data);
    };

    return (
        <div>
            <h2>Remix Challenges</h2>
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    value={newChallenge}
                    onChange={(e) => setNewChallenge(e.target.value)}
                    placeholder="Enter new challenge"
                    required
                />
                <button type="submit">Submit Challenge</button>
            </form>
            <ul>
                {challenges.map((challenge, index) => (
                    <li key={index}>{challenge}</li>
                ))}
            </ul>
        </div>
    );
};

export default RemixChallenges;