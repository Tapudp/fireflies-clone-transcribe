export interface Meeting {
  id: string;
  title: string;
  date: Date;
  participants: string[];
  recordingUrl?: string;
  transcription?: TranscriptionSegment[];
  summary?: string;
  actionItems?: ActionItem[];
}

export interface TranscriptionSegment {
  id: string;
  speaker: string;
  text: string;
  timestamp: number; // in seconds
}

export interface ActionItem {
  id: string;
  text: string;
  assignedTo: string;
  completed: boolean;
}