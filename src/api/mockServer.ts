import httpMock from './httpMock';
import type { Meeting, TranscriptionSegment, ActionItem } from './types';
import { v4 as uuidv4 } from 'uuid';

// Mock database
const meetings: Meeting[] = [
  {
    id: '1',
    title: 'Quarterly Planning',
    date: new Date(2023, 10, 15),
    participants: ['john@example.com', 'jane@example.com'],
    recordingUrl: 'https://mock-recording-service.com/1',
    transcription: [
      {
        id: 't1',
        speaker: 'John',
        text: 'Let\'s review our Q3 results',
        timestamp: 5
      }
    ],
    summary: 'Discussed Q3 results and plans for Q4',
    actionItems: [
      {
        id: 'a1',
        text: 'Prepare marketing plan',
        assignedTo: 'jane@example.com',
        completed: false
      }
    ]
  }
];

/**
 * 200 for success
 * 400 for bad requests
 * 404 for not found
 * 422 for validation errors
 */

export const mockApi = {
  // Meeting operations
  createMeeting: (title: string, participants: string[]): Promise<Meeting> => {
    if (!title) return httpMock.error('Title is required', 422);
    const newMeeting: Meeting = {
      id: uuidv4(),
      title,
      date: new Date(),
      participants,
    };
    meetings.push(newMeeting);
    return httpMock.success(newMeeting);
  },

  getMeetings: (): Promise<Meeting[]> => httpMock.success([...meetings]),

  getMeeting: (id: string): Promise<Meeting> => {
    const meeting = meetings.find(m => m.id === id);
    return meeting
      ? httpMock.success(meeting)
      : httpMock.error('Meeting not found', 404);
  },

  updateMeeting: (id: string, updates: Partial<Meeting>) => {
    const index = meetings.findIndex(m => m.id === id);
    if (index === -1) return httpMock.error('Meeting not found', 404);

    meetings[index] = { ...meetings[index], ...updates };
    return httpMock.success(meetings[index]);
  },


  // Recording simulation
  startRecording: (meetingId: string) => {
    const meeting = meetings.find(m => m.id === meetingId);
    if (!meeting) return httpMock.error('Meeting not found', 404);

    meeting.recordingUrl = `https://mock-recording-service.com/${meetingId}`;
    return httpMock.success({ success: true }, 500); // Simulate network delay
  },


  // Transcription simulation
  generateTranscription: async (meetingId: string): Promise<TranscriptionSegment[]> => {
    const meeting = meetings.find(m => m.id === meetingId);
    if (!meeting) return httpMock.error('Meeting not found', 404);

    const mockTranscription: TranscriptionSegment[] = [
      {
        id: uuidv4(),
        speaker: 'John Doe',
        text: 'Let\'s discuss the quarterly results.',
        timestamp: 5,
      },
      {
        id: uuidv4(),
        speaker: 'Jane Smith',
        text: 'The revenue has increased by 15% compared to last quarter.',
        timestamp: 10,
      },
      {
        id: uuidv4(),
        speaker: 'John Doe',
        text: 'That\'s great news. What about our expenses?',
        timestamp: 15,
      },
    ];

    meeting.transcription = mockTranscription;
    return httpMock.success(mockTranscription, 2000); // Simulate processing delay
  },

  // Summary & Action Items simulation
  generateSummary: async (meetingId: string): Promise<{ summary: string; actionItems: ActionItem[] }> => {
    const meeting = meetings.find(m => m.id === meetingId);
    if (!meeting) return httpMock.error('Meeting not found', 404);

    let mockSummary = 'Could not generate summary.';
    let mockActionItems: ActionItem[] = [];

    if (meeting?.transcription) {
      const speakers = [...new Set(meeting.transcription.map(t => t.speaker))];
      const topics = meeting.transcription
        .filter(t => t.text.includes('discuss') || t.text.includes('talk about'))
        .map(t => t.text.split('discuss')[1] || t.text.split('talk about')[1] || 'general topics');

      mockSummary = `The meeting between ${speakers.join(' and ')} covered ${topics.join(', ')}. ` +
        `Key points were discussed and action items were identified.`;

      mockActionItems = speakers.map((speaker, index) => ({
        id: uuidv4(),
        text: `Follow up on ${topics[index] || 'discussion points'}`,
        assignedTo: speaker,
        completed: false,
      }));

      // Ensure we have at least one action item
      if (mockActionItems.length === 0) {
        mockActionItems = [{
          id: uuidv4(),
          text: 'Prepare for next meeting',
          assignedTo: speakers[0] || 'Team',
          completed: false,
        }];
      }
    }

    const meetingIndex = meetings.findIndex(m => m.id === meetingId);
    if (meetingIndex !== -1) {
      meetings[meetingIndex].summary = mockSummary;
      meetings[meetingIndex].actionItems = mockActionItems;
    }

    return httpMock.success(
      { summary: mockSummary, actionItems: mockActionItems },
      1500 // Simulate AI processing delay
    );
  },
};