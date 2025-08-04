export interface TrackMetadata {
    name: string;
    genre: string;
    bpm: number;
    key: string;
    mood: string;
    tags: string[];
}

export interface Feedback {
    userId: string;
    trackId: string;
    comment: string;
    timestamp: Date;
}

export interface RemixChallenge {
    id: string;
    title: string;
    description: string;
    type: ChallengeType;
    submissionDeadline: Date;
}

export enum ChallengeType {
    Remix = "REMIx",
    Cover = "COVER",
    Original = "ORIGINAL"
}