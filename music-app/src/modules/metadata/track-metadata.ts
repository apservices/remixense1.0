export interface TrackMetadata {
    name: string;
    genre: string;
    bpm: number;
    key: string;
    mood: string;
    tags: string[];
}

export function createTrackMetadata(name: string, genre: string, bpm: number, key: string, mood: string, tags: string[]): TrackMetadata {
    return {
        name,
        genre,
        bpm,
        key,
        mood,
        tags,
    };
}

export function updateTrackMetadata(metadata: TrackMetadata, updates: Partial<TrackMetadata>): TrackMetadata {
    return { ...metadata, ...updates };
}

export function validateTrackMetadata(metadata: TrackMetadata): boolean {
    const { name, genre, bpm, key, mood, tags } = metadata;
    return (
        typeof name === 'string' && name.length > 0 &&
        typeof genre === 'string' && genre.length > 0 &&
        typeof bpm === 'number' && bpm > 0 &&
        typeof key === 'string' && key.length > 0 &&
        typeof mood === 'string' && mood.length > 0 &&
        Array.isArray(tags) && tags.every(tag => typeof tag === 'string')
    );
}