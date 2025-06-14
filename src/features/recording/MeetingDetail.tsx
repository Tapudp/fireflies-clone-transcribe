import type { Meeting } from "../../api/types";
import { mockApi } from "../../api/mockServer";
import { FiArrowLeft, FiMic, FiCheck, FiX } from "react-icons/fi";
import { format } from "date-fns";
import { useEffect, useState } from "react";
import TranscriptionViewer from "../transcription/TranscriptionViewer";

interface MeetingDetailProps {
  meeting: Meeting;
  onBack: () => void;
}

export default function MeetingDetail({ meeting, onBack }: MeetingDetailProps) {
  const [currentMeeting, setCurrentMeeting] = useState(meeting);
  const [isRecording, setIsRecording] = useState(false);
  const [isLoadingTranscription, setIsLoadingTranscription] = useState(false);
  const [isLoadingSummary, setIsLoadingSummary] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "details" | "transcription" | "summary"
  >("details");

  const handleStartRecording = async () => {
    setIsRecording(true);
    await mockApi.startRecording(currentMeeting.id);
    setCurrentMeeting((prev) => ({
      ...prev,
      recordingUrl: `https://mock-recording-service.com/${prev.id}`,
    }));
  };

  const handleGenerateTranscription = async () => {
    setIsLoadingTranscription(true);
    const transcription = await mockApi.generateTranscription(
      currentMeeting.id
    );
    setCurrentMeeting((prev) => ({
      ...prev,
      transcription,
    }));
    setIsLoadingTranscription(false);
    setActiveTab("transcription");
  };

  const handleGenerateSummary = async () => {
    setIsLoadingSummary(true);
    const { summary, actionItems } = await mockApi.generateSummary(
      currentMeeting.id
    );
    setCurrentMeeting((prev) => ({
      ...prev,
      summary,
      actionItems,
    }));
    setIsLoadingSummary(false);
    setActiveTab("summary");
  };

  const toggleActionItem = async (itemId: string) => {
    const item = currentMeeting.actionItems?.find((i) => i.id === itemId);
    if (!item) return;

    try {
      // Optimistic update
      const updatedItems = currentMeeting.actionItems?.map((i) =>
        i.id === itemId ? { ...i, completed: !i.completed } : i
      );
      setCurrentMeeting((prev) => ({ ...prev, actionItems: updatedItems }));

      // Update with mock server (includes built-in delay)
      await mockApi.updateMeeting(currentMeeting.id, {
        actionItems: updatedItems,
      });

      // Success feedback
      alert(
        `Action item marked as ${!item.completed ? "complete" : "incomplete"}`
      );
    } catch (error) {
      // Revert on error
      setCurrentMeeting((prev) => ({
        ...prev,
        actionItems: prev.actionItems?.map((i) =>
          i.id === itemId ? { ...i, completed: item.completed } : i
        ),
      }));
      console.error("Failed to save changes with this error : ", error);
      alert("Failed to save changes");
    }
  };

  // to sync with server data
  useEffect(() => {
    const loadMeeting = async () => {
      try {
        const freshMeeting = await mockApi.getMeeting(meeting.id);
        if (freshMeeting) {
          setCurrentMeeting(freshMeeting);
        }
      } catch (error) {
        console.error("Failed to refresh meeting:", error);
      }
    };

    loadMeeting();
  }, [meeting.id]); // Re-run when meeting ID changes

  return (
    <div className="meeting-detail">
      <button onClick={onBack} className="back-button">
        <FiArrowLeft /> Back to meetings
      </button>

      <div className="meeting-item-header">
        <h2>{currentMeeting.title}</h2>
        <span className="meeting-id">#{meeting.id.slice(0, 6)}</span>
      </div>
      <p>{format(new Date(currentMeeting.date), "MMM dd, yyyy - h:mm a")}</p>
      <p>Participants: {currentMeeting.participants.join(", ")}</p>

      <div className="tabs">
        <button
          className={`tab-button ${activeTab === "details" ? "active" : ""}`}
          onClick={() => setActiveTab("details")}
        >
          Details
        </button>
        <button
          className={`tab-button ${
            activeTab === "transcription" ? "active" : ""
          }`}
          onClick={() => setActiveTab("transcription")}
          disabled={!currentMeeting.transcription}
        >
          Transcription
        </button>
        <button
          className={`tab-button ${activeTab === "summary" ? "active" : ""}`}
          onClick={() => setActiveTab("summary")}
          disabled={!currentMeeting.summary}
        >
          Summary & Actions
        </button>
      </div>

      <div className="tab-content">
        {activeTab === "details" && (
          <div className="recording-section">
            {currentMeeting.recordingUrl ? (
              <div className="recording-actions">
                <p
                  className="recording-status"
                  onClick={() =>
                    alert(
                      "This would play the recording in a real implementation"
                    )
                  }
                >
                  <FiMic /> Recording available (click to play)
                </p>
                <div className="action-buttons">
                  {!currentMeeting.transcription && (
                    <button
                      onClick={handleGenerateTranscription}
                      disabled={isLoadingTranscription}
                      className="action-button"
                    >
                      {isLoadingTranscription
                        ? "Processing..."
                        : "Generate Transcription"}
                    </button>
                  )}
                  {currentMeeting.transcription && !currentMeeting.summary && (
                    <button
                      onClick={handleGenerateSummary}
                      disabled={isLoadingSummary}
                      className="action-button"
                    >
                      {isLoadingSummary ? "Processing..." : "Generate Summary"}
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <button
                onClick={handleStartRecording}
                disabled={isRecording}
                className="record-button"
              >
                {isRecording ? "Recording..." : "Start Recording"}
              </button>
            )}
          </div>
        )}

        {activeTab === "transcription" && currentMeeting.transcription && (
          <TranscriptionViewer
            segments={currentMeeting.transcription}
            isLoading={isLoadingTranscription}
          />
        )}

        {activeTab === "summary" && currentMeeting.summary && (
          <div className="summary-section">
            <div className="summary-content">
              <h3>Meeting Summary</h3>
              <p>{currentMeeting.summary}</p>
            </div>

            {currentMeeting.actionItems &&
              currentMeeting.actionItems.length > 0 && (
                <div className="action-items">
                  <h3>Action Items</h3>
                  <ul className="action-items-list">
                    {currentMeeting.actionItems.map((item) => (
                      <li key={item.id} className="action-item">
                        <button
                          onClick={() => toggleActionItem(item.id)}
                          className={`status-toggle ${
                            item.completed ? "completed" : ""
                          }`}
                          aria-label={
                            item.completed ? "Mark incomplete" : "Mark complete"
                          }
                        >
                          {item.completed ? <FiCheck /> : <FiX />}
                        </button>
                        <span
                          className={`item-text ${
                            item.completed ? "completed" : ""
                          }`}
                        >
                          {item.text}
                        </span>
                        <span className="assigned-to">
                          Assigned to: {item.assignedTo}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
          </div>
        )}
      </div>
    </div>
  );
}
