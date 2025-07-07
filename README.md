# PRD: Prompt Generator

## 1. Project Overview

This project is a web-based application designed to generate tailored prompts for various AI models, including image generation models like Flux1-Kontext, music generation models, and coding assistants. The application provides a user-friendly interface to input a theme, select a desired style, and choose an AI model, generating a specific and well-structured prompt based on these inputs.

The backend is a Node.js server that communicates with a local Ollama instance to fetch available AI models and generate the final prompts.

## 2. Features

- **Dynamic AI Model Loading:** Automatically fetches and displays a list of available AI models from the local Ollama service.
- **Multiple Prompt Styles:** Offers a variety of predefined prompt styles to cater to different use cases:
  - Realistic Photo
  - Cinematic Scene
  - Drawing/Illustration
  - Image Editing
  - AI Coding
  - ACE-Step (Instrumental Music)
  - Music (Keyword-based)
- **Web Interface:** A clean, single-page user interface with tabs for the generator and history.
- **Backend API:** An Express.js-based API that handles the logic for prompt generation and history management.
- **Asynchronous Operations:** Supports non-blocking prompt generation with a cancellation feature.
- **Copy to Clipboard:** Allows users to easily copy the generated prompt.
- **Prompt History:** Stores a history of generated prompts, including the user's prompt, the model, the prompt style, and the model's response.
- **Delete History:** Allows users to delete individual items from the prompt history.

## 3. Technologies Used

- **Frontend:** HTML5, CSS3, Vanilla JavaScript
- **Backend:** Node.js, Express.js
- **AI Integration:** Ollama (for model management and prompt generation)

## 4. How to Run the Project

### Prerequisites

- [Node.js](https://nodejs.org/) installed on your system.
- [Ollama](https://ollama.ai/) installed and running on `http://localhost:11434`.
- At least one model installed in Ollama (e.g., `ollama pull phi3`).

### Installation

1.  Clone the repository or download the source code.
2.  Open a terminal in the project's root directory.
3.  Install the necessary dependencies:
    ```bash
    npm install
    ```

### Running the Server

1.  After installation, start the server:
    ```bash
    npm start
    ```
2.  The server will be running at `http://localhost:3000`.
3.  Open your web browser and navigate to this address to use the application.

## 5. API Endpoints

### `GET /api/models`

- **Description:** Fetches the list of available models from the Ollama instance.
- **Method:** `GET`
- **Success Response (200):**
  ```json
  [
    {
      "name": "model-name:latest",
      "modified_at": "...",
      "size": "..."
    }
  ]
  ```
- **Error Response (500):**
  ```json
  {
    "error": "Failed to fetch models from Ollama"
  }
  ```

### `POST /generate`

- **Description:** Generates a prompt based on the provided theme, style, and model.
- **Method:** `POST`
- **Request Body:**
  ```json
  {
    "theme": "A futuristic city at sunset",
    "systemPrompt": "cinematic",
    "model": "phi3:latest"
  }
  ```
- **Success Response (200):**
  ```json
  {
    "prompt": "A breathtaking cinematic shot of a futuristic metropolis during sunset..."
  }
  ```
- **Error Response (400/500):**
  ```json
  {
    "prompt": "Error message"
  }
  ```

### `GET /api/history`

- **Description:** Fetches the prompt history.
- **Method:** `GET`
- **Success Response (200):**
  ```json
  [
    {
      "user_prompt": "...",
      "model": "...",
      "prompt_style": "...",
      "model_response": "...",
      "timestamp": "..."
    }
  ]
  ```

### `DELETE /api/history/:timestamp`

- **Description:** Deletes a specific item from the prompt history.
- **Method:** `DELETE`
- **URL Params:** `timestamp=[string]`
- **Success Response (200):**
  ```json
  {
    "message": "History item deleted."
  }
  ```
- **Error Response (500):**
  ```json
  {
    "error": "..."
  }
  ```

## 6. System Prompts (Prompt Styles)

The application uses a set of "system prompts" to frame the user's theme into a detailed prompt for the AI. Each system prompt is designed for a specific output style:

- **Realistic Photo:** For generating ultra-realistic image descriptions.
- **Cinematic Scene:** For creating prompts that feel like a still from a film.
- **Drawing/Illustration:** For generating prompts that specify an artistic style.
- **Image Editing:** For prompts that modify an existing image's context.
- **AI Coding:** For translating a natural language request into a technical prompt for a coding AI.
- **ACE-Step:** For generating prompts for instrumental-only music.
- **Music:** For generating a comma-separated list of keywords for music generation.
