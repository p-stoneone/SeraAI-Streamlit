import streamlit as st
import google.generativeai as genai
import json
import os
import pymongo
from bson import json_util
import textwrap
import time
from PyPDF2 import PdfReader
import hashlib
from datetime import datetime, timedelta

# Note: Enable comments to access logging
# import logging
# logging.basicConfig(level=logging.INFO)

# Password hashing function
def hash_password(password):
    return hashlib.sha256(password.encode()).hexdigest()

# Initialize session state for login attempts and block time
if 'login_attempts' not in st.session_state:
    st.session_state.login_attempts = {}

# Check if the password is correct and handle rate limiting
def check_password():
    """Returns `True` if the user had the correct password."""
    
    # Get the user's IP address (in Streamlit Cloud, this would be the client's IP)
    ip = '127.0.0.1'  # Placeholder IP for local testing
    
    # Check if the IP is blocked
    if ip in st.session_state.login_attempts:
        last_attempt, attempts, block_time = st.session_state.login_attempts[ip]
        if block_time and datetime.now() < block_time:
            remaining_time = (block_time - datetime.now()).total_seconds() / 3600
            st.error(f"Too many failed attempts. Please try again in {remaining_time:.2f} hours.")
            return False
        elif block_time and datetime.now() >= block_time:
            # Reset attempts after block time
            st.session_state.login_attempts[ip] = (datetime.now(), 0, None)

    def password_entered():
        """Checks whether a password entered by the user is correct."""
        if hash_password(st.session_state["password"]) == st.secrets["PASSWORD"]:
            st.session_state["password_correct"] = True
            # Reset login attempts on successful login
            st.session_state.login_attempts[ip] = (datetime.now(), 0, None)
            # Set a session token
            st.session_state["session_token"] = hashlib.sha256(os.urandom(24).hex().encode()).hexdigest()
            del st.session_state["password"]  # Don't store the password.
        else:
            st.session_state["password_correct"] = False
            # Increment failed attempts
            last_attempt, attempts, _ = st.session_state.login_attempts.get(ip, (datetime.now(), 0, None))
            attempts += 1
            if attempts >= 5:
                block_time = datetime.now() + timedelta(hours=6)
                st.session_state.login_attempts[ip] = (datetime.now(), attempts, block_time)
                st.error("Too many failed attempts. You are blocked for 6 hours.")
            else:
                st.session_state.login_attempts[ip] = (datetime.now(), attempts, None)
                st.error(f"😕 Password incorrect. Attempt {attempts} of 5.")

    # First run, show input for password.
    if "password_correct" not in st.session_state:
        st.text_input(
            "Password", type="password", on_change=password_entered, key="password"
        )
        return False
    
    # Password incorrect, show input + error.
    elif not st.session_state["password_correct"]:
        st.text_input(
            "Password", type="password", on_change=password_entered, key="password"
        )
        return False
    
    # Password correct.
    else:
        # Check if session token exists and is valid
        if "session_token" not in st.session_state:
            st.session_state["password_correct"] = False
            return False
        return True


# Configure the Generative AI model
GOOGLE_API_KEY = st.secrets["GEMINI_API_KEY"]
genai.configure(api_key=GOOGLE_API_KEY)
model = genai.GenerativeModel('gemini-1.5-flash')
fallback_model = genai.GenerativeModel('gemini-1.0-pro')  # Fallback model

# MongoDB configuration
MONGODB_URI = st.secrets["MONGODB_URI"]

# Constants for turbo processing
MAX_RETRIES = 3
RETRY_DELAY = 2  # seconds
MAX_CHUNK_SIZE = 8000  # characters

# Initialize session state
if 'uploaded_files' not in st.session_state:
    st.session_state.uploaded_files = []
if 'summaries' not in st.session_state:
    st.session_state.summaries = {}
if 'problematic_files' not in st.session_state:
    st.session_state.problematic_files = {}
if 'processed' not in st.session_state:
    st.session_state.processed = False
if 'merged_json' not in st.session_state:
    st.session_state.merged_json = None

def extract_text_from_pdf(file):
    try:
        reader = PdfReader(file)
        text = ""
        for page in reader.pages:
            text += page.extract_text()
        return text
    except Exception as e:
        # logging.error(f"Error extracting text from PDF {file.name}: {str(e)}")
        return None

def generate_summary(text, filename):
    prompt = f"""
    Summarize the following Supreme Court judgment in the format specified below:
    
    {{
      "date": "YYYY-MM-DD",
      "CA": "CIVIL APPEAL NO./ Case Number/ Petition Number of case",
      "title": "A professional tone title summarizing the case",
      "Respondent": "Name of APPELLANT VS Name of RESPONDENTS",
      "background": "Brief background of the case explaining the dispute",
      "chronology": [
        "Month YYYY: Details of events in a single line.",
        "Month YYYY: Details of events in a single line." 
      ],
      "key_points": [
        "A key legal point discussed in the judgment.",
        "Another key legal point discussed in the judgment."
      ],
      "conclusion": [
        "A crisp and precise summary of the judgment's outcome."
      ],
      "Judgment_By": [
        "Name of the judge who have given the judgement with proper HON'BLE MR./MRS. JUSTICE"
      ]
    }}

    Judgment text:
    {text}
    """
    
    try:
        response = model.generate_content(prompt)
        # logging.info(f"Raw JSON Response generated successfully for {filename}.")

        cleaned_response = response.text.strip()
        if not (cleaned_response.startswith('{') and cleaned_response.endswith('}')):
            # logging.warning(f"Response for {filename} is not a valid JSON. Attempting to extract JSON...")
            start = cleaned_response.find('{')
            end = cleaned_response.rfind('}') + 1
            if start != -1 and end != 0:
                cleaned_response = cleaned_response[start:end]
            else:
                raise ValueError("Could not extract valid JSON from the response")
        
        return json.loads(cleaned_response), None
    except json.JSONDecodeError as e:
        # logging.error(f"JSON Decode Error for {filename}: {str(e)}")
        return None, cleaned_response
    except Exception as e:
        # logging.error(f"An error occurred while processing {filename}: {str(e)}")
        return None, str(e)

def process_pdf(file):
    text = extract_text_from_pdf(file)
    if text:
        summary, error_text = generate_summary(text, file.name)
        if summary:
            st.session_state.summaries[file.name] = summary
            if file.name in st.session_state.problematic_files:
                del st.session_state.problematic_files[file.name]
            return True
        else:
            st.session_state.problematic_files[file.name] = {
                "error": "Failed to generate summary",
                "text": error_text or text
            }
    else:
        st.session_state.problematic_files[file.name] = {
            "error": "Failed to extract text",
            "text": "No text could be extracted from the PDF."
        }
    return False

def insert_all_to_db():
    client = pymongo.MongoClient(MONGODB_URI)
    db = client['myDatabase']
    collection = db['SeraAI']

    if st.session_state.merged_json:
        try:
            # Parse the merged_json string back into a list of dictionaries
            merged_data = json.loads(st.session_state.merged_json)
            
            # Insert the data into MongoDB
            result = collection.insert_many(merged_data)
            st.success(f"Successfully inserted {len(result.inserted_ids)} documents into MongoDB.")
        except Exception as e:
            st.error(f"An error occurred while inserting data into MongoDB: {str(e)}")
    else:
        st.warning("No merged JSON data available. Please generate merged JSON first.")

def insert_json_to_db(json_data):
    client = pymongo.MongoClient(MONGODB_URI)
    db = client['myDatabase']
    collection = db['SeraAI']

    try:
        # Insert the data into MongoDB
        result = collection.insert_one(json_data)
        st.success(f"Successfully inserted {len(result.inserted_ids)} documents into MongoDB.")
    except Exception as e:
        st.error(f"An error occurred while inserting data into MongoDB: {str(e)}")

# New functions for turbo processing
def chunk_text(text, max_chunk_size):
    return textwrap.wrap(text, max_chunk_size, break_long_words=False, replace_whitespace=False)

def generate_summary_turbo(text, filename):
    prompt = f"""
    Summarize the following Supreme Court judgment in the format specified below:
    
    {{
      "date": "YYYY-MM-DD",
      "CA": "CIVIL APPEAL NO./ Case Number/ Petition Number of case",
      "title": "A professional tone title summarizing the case",
      "Respondent": "Name of APPELLANT VS Name of RESPONDENTS",
      "background": "Brief background of the case explaining the dispute",
      "chronology": [
        "Month YYYY: Details of events in a single line.",
        "Month YYYY: Details of events in a single line." 
      ],
      "key_points": [
        "A key legal point discussed in the judgment.",
        "Another key legal point discussed in the judgment."
      ],
      "conclusion": [
        "A crisp and precise summary of the judgment's outcome."
      ],
      "Judgment_By": [
        "Name of the judge who have given the judgement with proper HON'BLE MR./MRS. JUSTICE"
      ]
    }}

    Judgment text:
    {text}
    """
    
    for attempt in range(MAX_RETRIES):
        try:
            response = model.generate_content(prompt)
            if response.parts:  # Check if response has parts
                # logging.info(f"Raw JSON Response generated successfully for {filename}.")
                cleaned_response = response.text.strip()
                if not (cleaned_response.startswith('{') and cleaned_response.endswith('}')):
                    # logging.warning(f"Response for {filename} is not a valid JSON. Attempting to extract JSON...")
                    start = cleaned_response.find('{')
                    end = cleaned_response.rfind('}') + 1
                    if start != -1 and end != 0:
                        cleaned_response = cleaned_response[start:end]
                    else:
                        raise ValueError("Could not extract valid JSON from the response")
                
                return json.loads(cleaned_response), None
            else:
                # logging.warning(f"Empty response for {filename}. Retrying...")
                time.sleep(RETRY_DELAY)
        except Exception as e:
            # logging.error(f"Attempt {attempt + 1} failed for {filename}: {str(e)}")
            time.sleep(RETRY_DELAY)
    
    # If all retries fail, try with fallback model
    try:
        # logging.info(f"Trying fallback model for {filename}")
        response = fallback_model.generate_content(prompt)
        if response.parts:
            return json.loads(response.text.strip()), None
    except Exception as e:
        st.warning(f"Fallback model failed for {filename}: {str(e)}")
    
    return None, f"Failed to generate summary after {MAX_RETRIES} attempts and fallback."

def process_pdf_turbo(file):
    text = extract_text_from_pdf(file)
    if text:
        chunks = chunk_text(text, MAX_CHUNK_SIZE)
        summary = None
        for i, chunk in enumerate(chunks):
            chunk_summary, error_text = generate_summary_turbo(chunk, f"{file.name}_chunk_{i}")
            if chunk_summary:
                if summary is None:
                    summary = chunk_summary
                else:
                    # Merge summaries logically
                    summary['key_points'].extend(chunk_summary['key_points'])
                    summary['conclusion'].extend(chunk_summary['conclusion'])
        if summary:
            st.session_state.summaries[file.name] = summary
            if file.name in st.session_state.problematic_files:
                del st.session_state.problematic_files[file.name]
            return True
        else:
            st.session_state.problematic_files[file.name] = {
                "error": "Failed to generate summary using turbo model",
                "text": error_text or text
            }
    else:
        st.session_state.problematic_files[file.name] = {
            "error": "Failed to extract text",
            "text": "No text could be extracted from the PDF."
        }
    return False

def reset_app():
    st.session_state.uploaded_files = []
    st.session_state.summaries = {}
    st.session_state.problematic_files = {}
    st.session_state.processed = False
    st.session_state.merged_json = None
    st.rerun()  # Force a rerun to reset the UI

def main():

    # Password protection
    if not check_password():
        st.stop()  # Don't run the rest of the app.

    # Reset button
    if st.button("Reset", key="reset_button"):
        reset_app()

    with st.expander("Upload PDF Files"):
        uploaded_files = st.file_uploader("Upload PDF files", type="pdf", accept_multiple_files=True)
        if uploaded_files:
            st.session_state.uploaded_files = uploaded_files
            st.success(f"Uploaded {len(uploaded_files)} PDF files.")

    with st.expander("Generate Summaries"):
        if st.button("Start Generating Summaries"):
            st.session_state.summaries = {}
            st.session_state.problematic_files = {}
            st.session_state.processed = True
            for file in st.session_state.uploaded_files:
                process_pdf(file)
            
            st.success("Summary generation complete!")

        if st.session_state.processed:
            st.write("Processing Results:")
            def update_file_lists():
                return (
                    list(st.session_state.summaries.keys()) + list(st.session_state.problematic_files.keys()),
                    list(st.session_state.summaries.keys()),
                    list(st.session_state.problematic_files.keys())
                )

            all_files, successful_files, unsuccessful_files = update_file_lists()

            # Default selection based on presence of unsuccessful files
            if unsuccessful_files:
                default_selection = "Unsuccessful Files"
            else:
                default_selection = "All PDF files"

            source = st.radio("Choose source:", ("All PDF files", "Successfully Processed Files", "Unsuccessful Files"), index=["All PDF files", "Successfully Processed Files", "Unsuccessful Files"].index(default_selection))
            
            if source == "All PDF files":
                file_list = all_files
            elif source == "Successfully Processed Files":
                file_list = successful_files
            elif source == "Unsuccessful Files":
                file_list = unsuccessful_files
            
            selected_file = st.selectbox("Select a file to view details:", file_list)
            
            if selected_file in st.session_state.summaries:
                st.success(f"✅ {selected_file}")
                st.json(st.session_state.summaries[selected_file])

            elif selected_file in st.session_state.problematic_files:
                problem = st.session_state.problematic_files[selected_file]
                st.error(f"❌ {selected_file}: {problem['error']}")
                
                col1, col2 = st.columns(2)
                with col1:
                    if st.button(f"Retry for current PDF", key=f"retry_{selected_file}"):
                        file = next((f for f in st.session_state.uploaded_files if f.name == selected_file), None)
                        if file and process_pdf(file):
                            st.success(f"Successfully processed {selected_file}")
                            all_files, successful_files, unsuccessful_files = update_file_lists()
                            st.rerun()
                        else:
                            st.error(f"Failed to process {selected_file}")
                with col2:
                    if st.button(f"Run current PDF on turbo model", key=f"turbo_{selected_file}"):
                        file = next((f for f in st.session_state.uploaded_files if f.name == selected_file), None)
                        if file:
                            with st.spinner(f"Processing {selected_file} with turbo model..."):
                                if process_pdf_turbo(file):
                                    st.success(f"Successfully processed {selected_file} with turbo model")
                                    all_files, successful_files, unsuccessful_files = update_file_lists()
                                    st.rerun()
                                else:
                                    st.error(f"Failed to process {selected_file} with turbo model")
                        else:
                            st.error(f"Could not find file {selected_file}")

            if st.button("Generate Merged JSON"):
                st.session_state.merged_json = json.dumps(list(st.session_state.summaries.values()), indent=2)
                st.success("Merged JSON generated successfully.")

                if st.session_state.merged_json:
                        st.download_button(
                        label="Download Merged JSON",
                        data=st.session_state.merged_json,
                        file_name="merged_summaries.json",
                        mime="application/json")

    with st.expander("Insert into DB"):
        source = st.radio("Choose source:", ("Use Generated JSON", "Edit Generated JSON", "Upload JSON"))

        if source == "Use Generated JSON":
            if st.session_state.merged_json:
                if st.button("Insert into MongoDB"):
                    insert_all_to_db()
            else:
                st.warning("No generated JSON available. Please generate merged JSON first.")
        elif source == "Edit Generated JSON":
            if st.session_state.merged_json:
                edited_json = st.text_area("Edit JSON", st.session_state.merged_json, height=300)
                if st.button("Insert Edited JSON into MongoDB"):
                    try:
                        edited_data = json.loads(edited_json)
                        client = pymongo.MongoClient(MONGODB_URI)
                        db = client['myDatabase']
                        collection = db['SeraAI']
                        result = collection.insert_many(edited_data)
                        st.success(f"Successfully inserted {len(result.inserted_ids)} documents into MongoDB.")
                    except json.JSONDecodeError:
                        st.error("Invalid JSON. Please check your edits and try again.")
                    except Exception as e:
                        st.error(f"An error occurred while inserting data into MongoDB: {str(e)}")
            else:
                st.warning("No generated JSON available. Please generate merged JSON first.")
        elif source == "Upload JSON":
            file = st.file_uploader("Upload JSON", type="json")
            if file:
                if st.button("Insert into MongoDB"):
                    insert_json_to_db(file)
