import type { Meeting } from "../../api/types";
import { FiPlus } from "react-icons/fi";
import { format } from "date-fns";

interface MeetingListProps {
  meetings: Meeting[];
  onCreateMeeting: () => void;
  onSelectMeeting: (meeting: Meeting) => void;
  isLoading?: boolean;
}

export default function MeetingList({
  meetings,
  onCreateMeeting,
  onSelectMeeting,
  isLoading,
}: MeetingListProps) {
  return (
    <div className="meeting-list">
      <div className="meeting-list-header">
        <h2 className="meeting-list-title">Your Meetings</h2>
        <button
          onClick={onCreateMeeting}
          className="create-meeting-btn"
          disabled={isLoading}
        >
          <FiPlus /> New Meeting
        </button>
      </div>

      {isLoading ? (
        <p>Loading meetings...</p>
      ) : meetings.length === 0 ? (
        <p>No meetings yet. Create your first meeting!</p>
      ) : (
        <ul className="meeting-items">
          {meetings.map((meeting) => (
            <li
              key={meeting.id}
              onClick={() => onSelectMeeting(meeting)}
              className="meeting-item"
            >
              <div className="meeting-item-header">
                <h3>{meeting.title}</h3>
                <span className="meeting-id">#{meeting.id.slice(0, 6)}</span>
              </div>
              <p>{format(new Date(meeting.date), "MMM dd, yyyy - h:mm a")}</p>
              <p>Participants: {meeting.participants.join(", ")}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
