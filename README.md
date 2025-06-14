# Fireflies.ai Clone - Technical Challenge

A simplified replica of Fireflies.ai's core functionality with meeting recording simulation, transcription, and summary generation.
- Available to view on this web-URL : https://fireflies-clone-transcribe-git-main-divyesh-parmars-projects.vercel.app/

## Setup & Installation

1. **Clone the repository**
   ```bash
   git clone git@github.com:Tapudp/fireflies-clone-transcribe.git
   cd fireflies-clone
   ```

2. Install dependencies
    ```bash
    npm install
    ```
3. Run the development server
    ```bash
    npm run dev
    ```

4. Open in browser
    ```text
    http://localhost:5173
    ```

    ---

## Project structure
    src/
    ├── api/                # Mock backend (types & services)
    ├── features/           # Feature modules
    ├── App.tsx             # Root component
    └── main.tsx            # Vite entry

## Assumptions & Limitations
  - All data is mock/simulated (no real recording/transcription)
  - No backend persistence (data resets on refresh)
  - Tested on modern browsers (Chrome/Firefox/Safari)