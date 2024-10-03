from bs4 import BeautifulSoup
from bson import json_util
from datetime import datetime, timedelta
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


# Expander -3 Functions
def generate_newsletter(case_summaries, start_date, end_date):
    prompt = f"""
    You are a technical writing expert and newsletter guru, specializing in crafting highly engaging content with captivating headlines and subject lines. Analyze the following list of Supreme Court case summaries from the week of {start_date.strftime('%B %d, %Y')} to {end_date.strftime('%B %d, %Y')} and create a weekly newsletter post that compels readers to gain insights. The article must target legal industry professionals, so the tone of the newsletter generated needs to be professional to properly target readers.

    Case Summaries:
    {json.dumps(case_summaries, indent=2)}

    Generate a single newsletter post in HTML format with the following structure:
    Use appropriate HTML tags for formatting, including <h1>, <h2>, <h3>, <p>, <ul>, <li>, etc.
    To generate the read more reference links use this simple strategy - https://seraphicadvisors.com/sera-ai/YYYY-MM-DD/id , just replace the date in the link and id with $oid value
    
    Here is the structure for you to follow:
        <html>
        <head>
            <title>Weekly Supreme Court Insights: [Start Date] - [End Date]</title>
        </head>
        <body>
            <h2 style="text-align: left; color:black;">Supreme Court Judgments - Highlights from last week</h2>
            <h3 style="text-align: left; color:black;">[Most Impactful Case Title]</h3>
            <p style="text-align: left; color:black;">[Brief summary and key insights of the most impactful case]</p>
            <p style="text-align:left;">[Name of APPELLANT VS Name of RESPONDENTS, decided on DD-MM-YYYY]</p>
            <p style="text-align: left;"><strong><span style="color:red;">Read the Full Article: </span></strong><a href="https://seraphicadvisors.com/sera-ai/YYYY-MM-DD/id" tabindex="-1" style="color: blue;"><span style="color:blue;">Here</span></a><br></p>
            
            <h2 style="text-align: left; color:black;">Other Notable Decisions This Week:</h2>
            
            [Repeat the following section for all remaining cases]
            <h3 style="text-align: left; color:black;">[Case Title]</h3>
            <p style="text-align:left;">[Name of APPELLANT VS Name of RESPONDENTS, decided on DD-MM-YYYY]</p>
            <p style="text-align: left;"><strong><span style="color:red;">Read the Full Article: </span></strong><a href="https://seraphicadvisors.com/sera-ai/YYYY-MM-DD/id" style="color: blue;" tabindex="-1"><span style="color:blue;">Here</span></a><br/></p>
        </body>
        </html>
    """

    response = model.generate_content(prompt)
    return response.text

def extract_title_and_body(html_content):
    soup = BeautifulSoup(html_content, 'html.parser')
    title = soup.title.string if soup.title else "No title found"
    body = str(soup.body) if soup.body else "No body content found"
    return title, body

def fetch_articles_from_mongodb(start_date, end_date):
    client = pymongo.MongoClient(MONGODB_URI)
    db = client['myDatabase']
    collection = db['SeraAI']

    start_date_str = start_date.strftime('%Y-%m-%d')
    end_date_str = end_date.strftime('%Y-%m-%d')
    
    articles = collection.find({
        'date': {
            '$gte': start_date_str,
            '$lte': end_date_str
        }
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

def generate_subject(newsletter_title):
    return f"Seraphic Advisors - Newsletter || {newsletter_title}"

def schedule_newsletter(newsletter_title, newsletter_body):
    st.subheader("Schedule Newsletter - Brevo Mail")

    # Template selection
    templates = get_templates()
    selected_template = st.selectbox("Select a template", templates, format_func=lambda x: x[1])

    if selected_template:
        template_html = preview_template(selected_template[0])
        st.success("Template fetched successfully")

    # Email details
    subject = st.text_input("Email Subject", value=generate_subject(newsletter_title))
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

def main():
    with st.expander("Generate Weekly Newsletter"):
        source = st.radio("Choose source:", ("Fetch from MongoDB", "Upload JSON"))
        
        if source == "Fetch from MongoDB":
            start_date = st.date_input("Select start date of the week")
            end_date = st.date_input("Select end date of the week")
            if st.button("Fetch from MongoDB"):
                with st.spinner("Fetching articles from MongoDB..."):
                    st.session_state.mongodb_articles = fetch_articles_from_mongodb(start_date, end_date)
                    if st.session_state.mongodb_articles:
                        st.success(f"Fetched {len(st.session_state.mongodb_articles)} articles from MongoDB.")
                        st.session_state.summaries = {f"Article_{i+1}": article for i, article in enumerate(st.session_state.mongodb_articles)}
                        st.session_state.processed = True
                    else:
                        st.warning("No articles found for the selected date range.")
            case_summaries = st.session_state.mongodb_articles
        elif source == "Upload JSON":
            uploaded_file = st.file_uploader("Upload JSON file:", type=["json"])
            if uploaded_file is not None:
                case_summaries = json.load(uploaded_file)
                start_date = st.date_input("Select start date of the week")
                end_date = st.date_input("Select end date of the week")
        elif source == "Use Generated Summaries":
            if st.session_state.summaries:
                case_summaries = list(st.session_state.summaries.values())
                start_date = st.date_input("Select start date of the week")
                end_date = st.date_input("Select end date of the week")
            else:
                st.warning("No summaries generated yet. Please generate summaries first.")
                case_summaries = None
        
        if st.button("Generate Weekly Newsletter"):
            if case_summaries:
                with st.spinner("Generating weekly newsletter..."):
                    st.session_state.newsletter_content = generate_newsletter(case_summaries, start_date, end_date)
                    st.session_state.newsletter_title, st.session_state.newsletter_body = extract_title_and_body(st.session_state.newsletter_content)
                
                st.subheader("Email Subject")
                st.write(st.session_state.newsletter_title)

                st.subheader("Email Content (Rendered)")
                st.markdown(st.session_state.newsletter_body, unsafe_allow_html=True)

                st.subheader("Raw HTML Code")
                st.code(st.session_state.newsletter_body, language='html')

                # Save only the body content
                output_file = f'weekly_newsletter_{start_date.strftime("%Y-%m-%d")}_{end_date.strftime("%Y-%m-%d")}.html'
                
                # Option to download the generated HTML
                st.download_button(
                    label="Download HTML",
                    data=st.session_state.newsletter_body,
                    file_name=output_file,
                    mime="text/html"
                )
            else:
                st.error("Please provide case summaries to generate the weekly newsletter.")

    # The scheduling part remains largely the same
    with st.expander("Schedule Newsletter"):
        if st.session_state.newsletter_title and st.session_state.newsletter_body:
            st.session_state.newsletter_scheduled = schedule_newsletter(st.session_state.newsletter_title, st.session_state.newsletter_body)
            if st.session_state.newsletter_scheduled:
                st.success("Newsletter scheduled successfully.")
        else:
            st.warning("Please generate newsletter content before scheduling.")
