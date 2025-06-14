import { useState, useEffect } from "react";
import { mockApi } from "./api/mockServer";
import type { Meeting } from "./api/types";
import MeetingList from "./features/recording/MeetingList";
import MeetingDetail from "./features/recording/MeetingDetail";

function App() {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    // Load meetings on initial render
    const loadMeetings = async () => {
      setIsLoading(true);
      try {
        const data = await mockApi.getMeetings();
        setMeetings(data);
      } catch (error) {
        console.error("Failed to load meetings: ", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadMeetings();
  }, []);

  const handleCreateMeeting = async () => {
    const title = prompt("Enter meeting title:");
    if (!title) return;
    const participantsInput = prompt("Enter participants (comma separated):");
    const participants = participantsInput
      ? participantsInput
          ?.split(",")
          .map((p) => p.trim())
          .filter((p) => p)
      : [];
    setIsLoading(true);

    try {
      await mockApi.createMeeting(title, participants);
      const updatedMeetings = await mockApi.getMeetings();
      setMeetings(updatedMeetings);
      const newMeeting = updatedMeetings[updatedMeetings.length - 1];
      setSelectedMeeting(newMeeting);
    } catch (error) {
      console.error("Failed to create meeting: ", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>Fireflies.ai Clone</h1>
      </header>

      <main className="app-main">
        {isLoading && <div className="loading-overlay">Loading...</div>}

        {selectedMeeting ? (
          <MeetingDetail
            meeting={selectedMeeting}
            onBack={() => setSelectedMeeting(null)}
          />
        ) : (
          <MeetingList
            meetings={meetings}
            onCreateMeeting={handleCreateMeeting}
            onSelectMeeting={setSelectedMeeting}
            isLoading={isLoading}
          />
        )}
      </main>
    </div>
  );
}

export default App;
