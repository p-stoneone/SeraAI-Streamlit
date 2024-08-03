# SeraAI - Streamlined Tool

This Streamlit application provides a user-friendly interface for processing and managing Supreme Court judgments. It leverages the power of Google's Gemini AI model to generate summaries of these judgments in a structured format, making it easier to analyze and extract key information.

## Features:

* **PDF Upload:** Upload multiple PDF files containing Supreme Court judgments.
* **Automated Summarization:** The application automatically generates summaries for each uploaded judgment using the Gemini AI model.
* **Structured Output:** Summaries are presented in a JSON format, including:
    * Date of judgment
    * Case number
    * Title summarizing the case
    * Appellant and Respondent names
    * Background of the dispute
    * Chronology of events
    * Key legal points discussed
    * Conclusion of the judgment
    * Judge(s) who delivered the judgment
* **Merged JSON Generation:** The application can merge all generated summaries into a single JSON file for easy download and further processing.
* **MongoDB Integration:**  The generated summaries can be directly inserted into a MongoDB database for efficient storage and retrieval.
* **Turbo Processing:**  The application utilizes a turbo processing mode for summary generation for failed cases, leveraging text chunking and retries for improved performance. (Note: The Turbo Processing hallucinates in various context, so it is recommended to perform a check before feeding output data to DB.)
* **Error Handling:**  The application provides clear error messages and allows for retrying failed summaries.
* **Password Protection:**  The application is password protected for enhanced security.

## Requirements

- Python 3.7+
- Streamlit
- Google Generative AI SDK
- PyMongo
- PyPDF2

## Installation:

1. **Create a Streamlit App:**
   - Create a new Python file (e.g., `SeraAI.py`) and copy the provided code into it.
2. **Install Dependencies:**
   - Install the required Python packages using pip:
     
     ```bash
     pip install streamlit pymongo google-generativeai PyPDF2 textwrap
     ```
3. **Set up Environment Variables:**
   - Create a `.streamlit/secrets.toml` file and add your API keys and MongoDB URI:
   - Add the following value in `.toml` format:
     
     ```
     GEMINI_API_KEY=YOUR_GEMINI_API_KEY
     MONGODB_URI=YOUR_MONGODB_URI
     PASSWORD=YOUR_PASSWORD
     ```
   - Replace `YOUR_GEMINI_API_KEY`, `YOUR_MONGODB_URI`, and `YOUR_PASSWORD` with your actual values.
   - To set up the initial password:
     - Generate the hash for "unhashed-password": 
       
       ```
         import hashlib
         print(hashlib.sha256("unhashed-password".encode()).hexdigest())
       ```
     - Add the obtained hash from above function to your Streamlit secrets file

         ```
           PASSWORD = "XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
         ```
4. **Run the App:**
   - Run the Streamlit app from your terminal:

     ```bash
     streamlit run SeraAI.py
     ```
5. Open your web browser and go to http://localhost:8501.

## Usage:

1. **Login:** Enter the unhashed-password you set in the `.streamlit/secrets.toml` file.
2. **Upload PDFs:** Click the "Upload PDF Files" expander and select the PDF files containing Supreme Court judgments.
3. **Generate Summaries:** Click the "Generate Summaries" button to start the summarization process.
4. **View Summaries:** Select a file from the list to view its generated summary.
5. **Generate Merged JSON:** Click the "Generate Merged JSON" button to create a single JSON file containing all summaries.
6. **Manage JSON:** Generate merged JSON summaries, edit them, or upload JSON files directly for insertion into the database.
7. **Insert into DB:** Choose a source (generated JSON, edited JSON, or uploaded JSON) and click the "Insert into MongoDB" button to store the data in your database.

**Note:**

* This application requires a Google Cloud Platform project with a Gemini API key and a MongoDB database.
* The code includes comments for logging and debugging purposes. You can enable these comments for troubleshooting.

## License:

This project is licensed under the MIT License.
