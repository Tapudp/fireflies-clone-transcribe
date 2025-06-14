import type { Meeting } from "../../api/types";
import { mockApi } from "../../api/mockServer";
import { FiArrowLeft, FiMic, FiCheck, FiX } from "react-icons/fi";
import { format } from "date-fns";
import { useState } from "react";
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

  const toggleActionItem = (itemId: string) => {
    setCurrentMeeting((prev) => {
      if (!prev.actionItems) return prev;

      const updatedActionItems = prev.actionItems.map((item) =>
        item.id === itemId ? { ...item, completed: !item.completed } : item
      );

      return {
        ...prev,
        actionItems: updatedActionItems,
      };
    });
  };

  return (
    <div className="meeting-detail">
      <button onClick={onBack} className="back-button">
        <FiArrowLeft /> Back to meetings
      </button>

      <h2>{currentMeeting.title}</h2>
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
                <p className="recording-status">
                  <FiMic /> Recording available
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
