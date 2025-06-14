import type { TranscriptionSegment } from "../../api/types";
import { FiUser } from "react-icons/fi";

interface TranscriptionViewerProps {
  segments: TranscriptionSegment[];
  isLoading?: boolean;
}

export default function TranscriptionViewer({
  segments,
  isLoading,
}: TranscriptionViewerProps) {
  if (isLoading) {
    return (
      <div className="loading-transcription">Generating transcription...</div>
    );
  }

  if (!segments || segments.length === 0) {
    return <div className="no-transcription">No transcription available</div>;
  }

  return (
    <div className="transcription-viewer">
      <h3>Meeting Transcription</h3>
      <div className="transcription-segments">
        {segments.map((segment) => (
          <div key={segment.id} className="transcription-segment">
            <div className="segment-header">
              <FiUser className="speaker-icon" />
              <span className="speaker-name">{segment.speaker}</span>
              <span className="segment-timestamp">
                {formatTimestamp(segment.timestamp)}
              </span>
            </div>
            <p className="segment-text">{segment.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// Helper function to format timestamp (seconds) to MM:SS format
function formatTimestamp(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, "0")}:${secs
    .toString()
    .padStart(2, "0")}`;
}
