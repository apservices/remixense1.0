import React from 'react';
import { TrackMetadata } from '../metadata/track-metadata';

interface MetadataPanelProps {
    metadata: TrackMetadata;
}

const MetadataPanel: React.FC<MetadataPanelProps> = ({ metadata }) => {
    return (
        <div className="metadata-panel">
            <h2>Track Metadata</h2>
            <ul>
                <li><strong>Name:</strong> {metadata.name}</li>
                <li><strong>Genre:</strong> {metadata.genre}</li>
                <li><strong>BPM:</strong> {metadata.bpm}</li>
                <li><strong>Key:</strong> {metadata.key}</li>
                <li><strong>Mood:</strong> {metadata.mood}</li>
                <li><strong>Tags:</strong> {metadata.tags.join(', ')}</li>
            </ul>
        </div>
    );
};

export default MetadataPanel;