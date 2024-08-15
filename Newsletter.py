from bs4 import BeautifulSoup
from bson import json_util
from datetime import datetime, timedelta
from dotenv import load_dotenv
import google.generativeai as genai
import hashlib
import json
import os
from pprint import pprint
import pymongo
from PyPDF2 import PdfReader
import pytz
import re
import requests
import sib_api_v3_sdk
from sib_api_v3_sdk.rest import ApiException
import streamlit as st
import tempfile
import textwrap
import time

# Load environment variables
load_dotenv()

# Note: Enable comments to access logging
# Configure logging
# logging.basicConfig(filename='summary_bot.log', level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s') 

# Configure the Generative AI model
GOOGLE_API_KEY = st.secrets["GEMINI_API_KEY"]
genai.configure(api_key=GOOGLE_API_KEY)
model = genai.GenerativeModel('gemini-1.5-flash')

# MongoDB configuration
MONGODB_URI = st.secrets["MONGODB_URI"]

# Constants for turbo processing
MAX_RETRIES = 3
RETRY_DELAY = 2  # seconds
MAX_CHUNK_SIZE = 8000  # characters

# Configure Brevo Mail API
configuration = sib_api_v3_sdk.Configuration()
configuration.api_key['api-key'] = st.secrets["BREVO_API_KEY"]

# Create instances of the API classes
template_api = sib_api_v3_sdk.TransactionalEmailsApi(sib_api_v3_sdk.ApiClient(configuration))
campaign_api = sib_api_v3_sdk.EmailCampaignsApi(sib_api_v3_sdk.ApiClient(configuration))
contacts_api_instance = sib_api_v3_sdk.ContactsApi(sib_api_v3_sdk.ApiClient(configuration))

# Function to sanitize file names
def sanitize_filename(filename):
    return re.sub(r'[<>:"/\\|?*]', '_', filename)

# Function to parse and convert date strings
def parse_date(date_str, input_format="%d-%b-%Y"):
    try:
        return datetime.strptime(date_str, input_format).date()
    except ValueError:
        return None

# Expander -1 Functions   
def fetch_from_website(user_date):
    url = 'https://www.sci.gov.in/#1697446384453-9aeef8cc-5f35'
    response = requests.get(url)
    fetched_pdfs = []

    if response.status_code == 200:
        soup = BeautifulSoup(response.content, 'html.parser')
        judgement_div = soup.find('div', {'id': '1697446384453-9aeef8cc-5f35'})
        
        if judgement_div:
            pdf_links = []
            for li in judgement_div.find_all('li'):
                a_tag = li.find('a', href=True)
                if a_tag and 'href' in a_tag.attrs:
                    href = a_tag['href']
                    if href.endswith('.pdf') or 'get_court_pdf' in href:
                        upload_div = a_tag.find('div', style="color:#5959dd;")
                        if upload_div:
                            upload_date_str = re.search(r'\d{2}-\d{2}-\d{4}', upload_div.text).group()
                            upload_date = datetime.strptime(upload_date_str, "%d-%m-%Y").date()
                            if upload_date and upload_date == user_date:
                                pdf_links.append((href, a_tag.text.strip(), upload_date))
            
            for idx, (link, description, upload_date) in enumerate(pdf_links):
                pdf_response = requests.get(link)
                if pdf_response.status_code == 200:
                    pdf_name = f"{idx+1}_{sanitize_filename(description[:100])}.pdf"
                    # Create a temporary file
                    with tempfile.NamedTemporaryFile(delete=False, suffix='.pdf') as temp_file:
                        temp_file.write(pdf_response.content)
                        fetched_pdfs.append((pdf_name, temp_file.name))
    
    return fetched_pdfs

def extract_text_from_pdf(pdf_path):
    try:
        with open(pdf_path, 'rb') as file:
            reader = PdfReader(file)
            text = ""
            for page in reader.pages:
                text += page.extract_text()
        return text
    except Exception as e:
        # logging.error(f"Error extracting text from PDF {pdf_path}: {str(e)}")
        return None

# New functions for turbo processing

def process_pdf(pdf_path):
    filename = os.path.basename(pdf_path)
    if st.session_state.fetched_pdfs:
            # Find the temporary file path for fetched PDFs
            temp_path = next((item[1] for item in st.session_state.fetched_pdfs if item[0] == filename), None)
            if temp_path:
                pdf_path = temp_path

    text = extract_text_from_pdf(pdf_path)
    if text:
        summary, error_text = generate_summary(text, filename)
        if summary:
            st.session_state.summaries[filename] = summary
            if filename in st.session_state.problematic_files:
                del st.session_state.problematic_files[filename]  # Remove from problematic files if successful
            return True
        else:
            st.session_state.problematic_files[filename] = {
                "error": "Failed to generate summary",
                "text": error_text or text
            }
    else:
        st.session_state.problematic_files[filename] = {
            "error": "Failed to extract text",
            "text": "No text could be extracted from the PDF."
        }
    return False

# Expander -2 Functions
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
        "A crisped and precise summary of the judgment's outcome."
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
            
            # Log the operation
            # logging.info(f"Inserted {len(result.inserted_ids)} documents into MongoDB.")
        except Exception as e:
            st.error(f"An error occurred while inserting data into MongoDB: {str(e)}")
            # logging.error(f"Error inserting data into MongoDB: {str(e)}")
    else:
        st.warning("No merged JSON data available. Please generate merged JSON first.")

# Functions for turbo processing
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
        "A crisped and precise summary of the judgment's outcome."
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
            if response.parts:
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

def process_pdf_turbo(pdf_path):

    filename = os.path.basename(pdf_path)

    if st.session_state.fetched_pdfs:
        # Find the temporary file path for fetched PDFs
        temp_path = next((item[1] for item in st.session_state.fetched_pdfs if item[0] == filename), None)
        if temp_path:
            pdf_path = temp_path

    text = extract_text_from_pdf(pdf_path)

    if text:
        chunks = chunk_text(text, MAX_CHUNK_SIZE)
        summary = None
        for i, chunk in enumerate(chunks):
            chunk_summary, error_text = generate_summary(chunk, f"{filename}_chunk_{i}")
            if chunk_summary:
                if summary is None:
                    summary = chunk_summary
                else:
                    # Merge summaries logically
                    summary['key_points'].extend(chunk_summary['key_points'])
                    summary['conclusion'].extend(chunk_summary['conclusion'])
        if summary:
            st.session_state.summaries[filename] = summary
            if filename in st.session_state.problematic_files:
                del st.session_state.problematic_files[filename]  # Remove from problematic files if successful
            return True
        else:
            st.session_state.problematic_files[filename] = {
                "error": "Failed to generate summary using turbo model",
                "text": error_text or text
            }
    else:
        st.session_state.problematic_files[filename] = {
            "error": "Failed to extract text",
            "text": "No text could be extracted from the PDF."
        }
    return False

# ----

# Expander -3 Functions
def generate_newsletter(case_summaries):
    prompt = f"""
    You are a technical writing expert and newsletter guru, specializing in crafting highly engaging content with captivating headlines and subject lines. Analyze the following list of Supreme Court case summaries and create a newsletter post that compels readers to gains insights, the article must target professionals so the tone of newsletter generated is also needs to be professional so that it properly target reader.

    Case Summaries:
    {json.dumps(case_summaries, indent=2)}

    Generate a single newsletter post in HTML format with the following structure:
    Use appropriate HTML tags for formatting, including <h1>, <h2>, <h3>, <p>, <ul>, <li>, etc.
    To generate the read more reference links use this simple strategy - https://seraphicadvisors.com/sera-ai/YYYY-MM-DD/id , just replace the date in the link and id with $oid value
    Here is sample example for you to first learn how to do it:
        <html>
        <head>
            <title> Title of the newsletter with most interesting one case </title>
        </head>
        <body>
            <h1 style="text-align: left; color:black;"> Title of the newsletter with most interesting one case </h1>
            <p style="text-align: left; color:black;">A little idea about that case</p>
            <p style="text-align: left;"><strong><span style="color:red;">Read the Full Article: </span></strong><a href="https://seraphicadvisors.com/sera-ai/2024-07-16/66974ecd4167f217f43965a1" tabindex="-1" style="color: blue;"><span style="color:blue;">Here</span></a><br></p>
            <p style="text-align:left;">[Name of APPELLANT VS Name of RESPONDENTS, decided on DD-MM-YYYY]</p>
            <br/>
            <h2 style="text-align: left; color:black;">Other Supreme Court Decisions You Might Find Interesting:</h2>
            <br/>
            <h3 style="text-align: left; color:black;">[Case 2 Title]</h3>
            <p style="text-align: left; color:black;">[Brief and insights of the case]</p>
            <p style="text-align: left;"><strong><span style="color:red;">Read the Full Article: </span></strong><a href="https://seraphicadvisors.com/sera-ai/YYYY-MM-DD/id" style="color: blue;" tabindex="-1"><span style="color:blue;">Here</span></a><br/></p>
            <p style="text-align:left;">[Name of APPELLANT VS Name of RESPONDENTS, decided on DD-MM-YYYY]</p>
            <br/>
            <h3 style="text-align: left; color:black;">[Case 3 Title]</h3>
            <p style="text-align: left; color:black;">[Brief and insights of the case]</p>
            <p style="text-align: left;"><strong><span style="color:red;">Read the Full Article: </span></strong><a href="https://seraphicadvisors.com/sera-ai/YYYY-MM-DD/id" style="color: blue;" tabindex="-1"><span style="color:blue;">Here</span></a><br/></p>
            <p style="text-align:left;">[Name of APPELLANT VS Name of RESPONDENTS, decided on DD-MM-YYYY]</p>
            <br/>
            <h3 style="text-align: left; color:black;">[Case 4 Title]</h3>
            <p style="text-align: left; color:black;">[Brief and insights of the case]</p>
            <p style="text-align: left;"><strong><span style="color:red;">Read the Full Article: </span></strong><a href="https://seraphicadvisors.com/sera-ai/YYYY-MM-DD/id" style="color: blue;" tabindex="-1"><span style="color:blue;">Here</span></a><br/></p>
            <p style="text-align:left;">[Name of APPELLANT VS Name of RESPONDENTS, decided on DD-MM-YYYY]</p>
            </body>
        </body>
        </html>
    """

    response = model.generate_content(prompt)
    return response.text

# Function to save the newsletter in HTML format - enable it in local development to save generated newsletter
# def save_html_output(content, output_file):
#     with open(output_file, 'w') as file:
#         file.write(content)

def extract_title_and_body(html_content):
    soup = BeautifulSoup(html_content, 'html.parser')
    title = soup.title.string if soup.title else "No title found"
    body = str(soup.body) if soup.body else "No body content found"
    return title, body

def fetch_articles_from_mongodb(date):
    client = pymongo.MongoClient(MONGODB_URI)
    db = client['myDatabase']
    collection = db['SeraAI']

    date_str = date.strftime('%Y-%m-%d')
    articles = collection.find({
        'date': date_str
    })
    
    # Convert BSON to JSON-serializable dictionaries
    return json.loads(json_util.dumps(list(articles)))

# Functions to schedule the newsletter - Brevo Mail
# Expander -4 Functions

def get_templates():
    try:
        api_response = template_api.get_smtp_templates(limit=10, offset=0, sort='desc')
        templates = [(template.id, template.name) for template in api_response.templates]
        return templates
    except ApiException as e:
        st.error(f"Exception when calling get_smtp_templates: {e}")
        return []

def preview_template(template_id):
    try:
        api_response = template_api.get_smtp_template(template_id)
        return api_response.html_content
    except ApiException as e:
        st.error(f"Exception when calling get_smtp_template: {e}")
        return ""

# Main Create Campaign draft code - Through Brevo
def create_campaign_draft(subject, sender_name, sender_email, modified_html, list_id, scheduled_utc_time):
    try:
        email_campaigns = {
            "name": subject,
            "subject": subject,
            "sender": {"name": sender_name, "email": sender_email},
            "htmlContent": modified_html,
            "recipients": {
                "listIds": [list_id]
            },
            "scheduledAt": scheduled_utc_time  # Adding the scheduled time
        }

        # Create the campaign draft
        api_response = campaign_api.create_email_campaign(email_campaigns)
        return f"Campaign scheduled successfully. ID: {api_response.id}"
    except ApiException as e:
        st.error(f"Exception when calling create_email_campaign: {e}")
        return f"Failed to create campaign draft: {e}"
    except Exception as ex:
        st.error(f"Unexpected error: {ex}")
        return f"An unexpected error occurred: {ex}"

def insert_custom_content(template_html, custom_html):
    placeholder = '<p style="margin: 0; background-font-weight: normal;">!-- CUSTOM_CONTENT --!</p>'
    if placeholder in template_html:
        return template_html.replace(placeholder, custom_html)
    else:
        return template_html.replace("</body>", f"{custom_html}</body>")

def convert_to_utc(ist_date_str, ist_time_str, am_pm):
    # Parse date and time from input
    ist_datetime_str = f"{ist_date_str} {ist_time_str} {am_pm}"
    ist_datetime = datetime.strptime(ist_datetime_str, "%Y-%m-%d %I:%M %p")

    # Set IST timezone
    ist_tz = pytz.timezone('Asia/Kolkata')
    ist_datetime = ist_tz.localize(ist_datetime)

    # Convert to UTC
    utc_datetime = ist_datetime.astimezone(pytz.utc)
    return utc_datetime.strftime("%Y-%m-%dT%H:%M:%S.%fZ")

def generate_subject():
    current_date = datetime.now().strftime("%d %B %Y")
    return f"Seraphic Advisors - Newsletter || {current_date}"

def schedule_newsletter(newsletter_title, newsletter_body):
    st.subheader("Schedule Newsletter - Brevo Mail")

    # Template selection
    templates = get_templates()
    selected_template = st.selectbox("Select a template", templates, format_func=lambda x: x[1])

    if selected_template:
        template_html = preview_template(selected_template[0])
        st.success("Template fetched successfully")

    # Email details
    subject = st.text_input("Email Subject", value=generate_subject())
    sender_name = st.text_input("Sender Name", value="Seraphic Advisors")
    sender_email = "newsletter@seraphicadvisors.info"

    # Custom HTML content
    custom_html = st.text_area("Email Body", value=newsletter_body, height=300)

    # Recipient list selection
    list_ids_input = st.text_input("List IDs (comma-separated):")
    list_ids = [int(i.strip()) for i in list_ids_input.split(",")] if list_ids_input else []

    if list_ids:
        st.write(f"Selected List IDs: {list_ids}")
        try:
            contacts_api_instance.get_contacts_from_list(list_ids[0])
            st.success(f"Successfully fetched contacts from list {list_ids[0]}")
        except ApiException:
            st.error(f"Unable to fetch contacts from list {list_ids[0]}")

    # Schedule time input (IST 12-hour format)
    ist_date = st.date_input("Select Date (IST)")
    ist_time = st.text_input("Select Time (12-hour format, e.g., 02:30)")
    am_pm = st.selectbox("AM/PM", ["AM", "PM"])

    if st.button("Create Campaign Draft"):
        if not all([subject, sender_name, sender_email, custom_html, list_ids, ist_date, ist_time, am_pm]):
            st.error("Please fill in all fields before creating the campaign draft.")
        else:
            scheduled_utc_time = convert_to_utc(str(ist_date), ist_time, am_pm)
            modified_html = insert_custom_content(template_html, custom_html)
            result = create_campaign_draft(subject, sender_name, sender_email, modified_html, list_ids[0], scheduled_utc_time)
            st.success(result)
            return True
    return False

# Reset function
def reset_app():
    st.session_state.pdf_files = []
    st.session_state.processed_files = set()
    st.session_state.summaries = {}
    st.session_state.problematic_files = {}
    st.session_state.processed = False
    st.session_state.merged_json = None
    st.session_state.newsletter_content = None
    st.session_state.newsletter_title = None
    st.session_state.newsletter_body = None
    st.session_state.mongodb_articles = []
    st.session_state.fetched_pdfs = []
    st.rerun() # Force a rerun to reset the UI

def main():

    # Reset button
    if st.button("Reset", key="reset_button"):
        reset_app()

    with st.expander("Fetch Articles"):
        fetch_date = st.date_input("Select upload date to fetch PDFs from website", key="fetch_date")
        if st.button("Fetch from Website"):
            user_date = fetch_date  # No need to combine with time
            with st.spinner("Fetching PDFs from website..."):
                st.session_state.fetched_pdfs = fetch_from_website(user_date)
                if st.session_state.fetched_pdfs:
                    st.success(f"Fetched {len(st.session_state.fetched_pdfs)} PDFs from the website.")
                    st.session_state.pdf_files = [pdf[0] for pdf in st.session_state.fetched_pdfs]
                else:
                    st.warning("No PDFs found for the selected date.")
        
        if st.session_state.pdf_files:
            st.write(f"{len(st.session_state.pdf_files)} PDF files found:")
            for pdf in st.session_state.pdf_files:
                st.write(f"- {pdf}")

    with st.expander("Generate Summaries"):
        if st.button("Start Generating Summaries"):
            st.session_state.summaries = {}
            st.session_state.problematic_files = {}
            st.session_state.processed = True
            for filename in st.session_state.pdf_files:
                pdf_path = (filename)
                process_pdf(pdf_path)
            
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
                # --- Preview JSON Functionality ---
                if st.button(f"Preview generated JSON"):
                    st.json(st.session_state.summaries[selected_file])
                # --- Edit JSON Functionality ---
                if st.button(f"Edit JSON"):
                    st.session_state[f"editing_{selected_file}"] = True  # Flag to control display
                
                if st.session_state.get(f"editing_{selected_file}"):
                    summary_json = st.session_state.summaries[selected_file]

                    st.subheader("Edit JSON:")
                    edited_json_str = st.text_area(
                        "Edit the JSON below:",
                        value=json.dumps(summary_json, indent=2),
                        height=300,
                        key=f"edit_area_{selected_file}"  # Unique key for the text area
                    )

                    try:
                        edited_json = json.loads(edited_json_str) 
                        if st.button("Save Changes", key=f"save_{selected_file}"):
                            st.session_state.summaries[selected_file] = edited_json
                            st.success("Changes saved successfully!")
                            del st.session_state[f"editing_{selected_file}"]  # Close the editor
                            # st.rerun()  # <--- This line is crucial to refresh the UI - enable it if required to remove that edit JSON after save
                    except json.JSONDecodeError:
                        st.error("Invalid JSON format. Please correct the JSON.")
                # --- End Edit JSON Functionality ---
            
            elif selected_file in st.session_state.problematic_files:
                problem = st.session_state.problematic_files[selected_file]
                st.error(f"❌ {selected_file}: {problem['error']}")
                col1, col2 = st.columns(2)
                with col1:
                    if st.button(f"Retry for current pdf", key=f"rerun_{selected_file}"):
                        pdf_path = (selected_file)
                        with st.spinner(f"Reprocessing {selected_file}..."):
                            if process_pdf(pdf_path):
                                st.success(f"Successfully processed {selected_file}")
                                all_files, successful_files, unsuccessful_files = update_file_lists()
                                st.rerun()
                            else:
                                st.error(f"Failed to process {selected_file}")
                with col2:
                    if st.button(f"Run on turbo model", key=f"turbo_{selected_file}"):
                        pdf_path = (selected_file)
                        with st.spinner(f"Processing {selected_file} with turbo model..."):
                            if process_pdf_turbo(pdf_path):
                                st.success(f"Successfully re-processed {selected_file} using turbo model")
                                all_files, successful_files, unsuccessful_files = update_file_lists()
                                st.rerun()
                            else:
                                st.error(f"Failed to generate new summary for {selected_file} using turbo model")
            
            if st.button("Generate Merged JSON"):
                st.session_state.merged_json = json.dumps(list(st.session_state.summaries.values()), indent=2)
                st.success("Merged JSON generated successfully.")
            
            if st.session_state.merged_json:
                col1, col2 = st.columns(2)
                with col1:
                    st.download_button(
                        label="Download Merged JSON",
                        data=st.session_state.merged_json,
                        file_name="merged_summaries.json",
                        mime="application/json"
                    )
                with col2:
                    if st.button("Insert all into MongoDB"):
                        insert_all_to_db()

    with st.expander("Generate Newsletter"):
        source = st.radio("Choose source:", ("Fetch from MongoDB", "Upload JSON", "Use Generated Summaries"))
        
        if source == "Fetch from MongoDB":
            date_picker = st.date_input("Select date to fetch articles from MongoDB")
            if st.button("Fetch from MongoDB"):
                with st.spinner("Fetching articles from MongoDB..."):
                    st.session_state.mongodb_articles = fetch_articles_from_mongodb(date_picker)
                    if st.session_state.mongodb_articles:
                        st.success(f"Fetched {len(st.session_state.mongodb_articles)} articles from MongoDB.")
                        st.session_state.summaries = {f"Article_{i+1}": article for i, article in enumerate(st.session_state.mongodb_articles)}
                        st.session_state.processed = True
                    else:
                        st.warning("No articles found for the selected date.")
            case_summaries = st.session_state.mongodb_articles
        elif source == "Upload JSON":
            uploaded_file = st.file_uploader("Upload JSON file:", type=["json"])
            if uploaded_file is not None:
                case_summaries = json.load(uploaded_file)
        elif source == "Use Generated Summaries":
            if st.session_state.summaries:
                case_summaries = list(st.session_state.summaries.values())
            else:
                st.warning("No summaries generated yet. Please generate summaries first.")
                case_summaries = None
        
        
        if st.button("Generate Newsletter"):
            if case_summaries:
                with st.spinner("Generating newsletter..."):
                    st.session_state.newsletter_content = generate_newsletter(case_summaries)
                    st.session_state.newsletter_title, st.session_state.newsletter_body = extract_title_and_body(st.session_state.newsletter_content)
                
                st.subheader("Email Subject")
                st.write(st.session_state.newsletter_title)

                st.subheader("Email Content (Rendered)")
                st.markdown(st.session_state.newsletter_body, unsafe_allow_html=True)

                st.subheader("Raw HTML Code")
                st.code(st.session_state.newsletter_body, language='html')

                # Save only the body content
                output_file = f'newsletter_{datetime.now().strftime("%Y-%m-%d")}.html'
                # Enable comment to start saving generated newsletter locally
                # save_html_output(st.session_state.newsletter_body, output_file)
                # st.success(f"Newsletter body content saved as {output_file}")

                # Option to download the generated HTML
                st.download_button(
                    label="Download HTML",
                    data=st.session_state.newsletter_body,
                    file_name=output_file,
                    mime="text/html"
                )
            else:
                st.error("Please provide case summaries to generate the newsletter.")

    with st.expander("Schedule Newsletter"):
        if st.session_state.newsletter_title and st.session_state.newsletter_body:
            st.session_state.newsletter_scheduled = schedule_newsletter(st.session_state.newsletter_title, st.session_state.newsletter_body)
            if st.session_state.newsletter_scheduled:
                st.success("Newsletter scheduled successfully.")
            # else:
            #     st.error("Failed to schedule newsletter.")
        else:
            st.warning("Please generate newsletter content before scheduling.")

