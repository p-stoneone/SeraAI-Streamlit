import streamlit as st
import base64
import Summary  # Import your Model.py module
import Newsletter  # Import your SeraAI.py module
import hashlib
from datetime import datetime, timedelta

# --- Authentication Functions ---
def hash_password(password):
    """Hashes a password using SHA256."""
    return hashlib.sha256(password.encode()).hexdigest()

# Function to get IP address
def get_client_ip():
    """Gets the client IP address, even if behind a proxy."""
    try:
        ip = st.get_query_params().get("client_ip")
        if ip:
            return ip[0]
        else:
            return "127.0.0.1"  # Return localhost if not found
    except Exception:
        return "127.0.0.1"  # Return localhost if an error occurs

def check_password(password):
    """Handles password authentication with rate limiting."""
    ip = get_client_ip()  # Get user's IP address (for both local testing & Streamlit Cloud)
    login_attempts = st.session_state.get('login_attempts', {}) 

    # Check if the IP is blocked
    if ip in login_attempts:
        last_attempt, attempts, block_time = login_attempts[ip]
        if block_time and datetime.now() < block_time:
            remaining_time = (block_time - datetime.now()).total_seconds() / 60
            st.error(f"Too many failed attempts. Please try again in {int(remaining_time)} minutes.")
            return False
        elif block_time and datetime.now() >= block_time:
            # Reset attempts after block time
            del login_attempts[ip]

    hashed_password = hash_password(password) 

    # Check password against both models
    if hashed_password == st.secrets["NEWSLETTER_PASSWORD"]:
        st.session_state["newsletter_authenticated"] = True
        return "Newsletter Model"
    elif hashed_password == st.secrets["SUMMARY_PASSWORD"]:
        st.session_state["summary_authenticated"] = True
        return "Summary Model"
    else: 
        # Increment failed attempts
        last_attempt, attempts, _ = login_attempts.get(ip, (datetime.now(), 0, None))
        attempts += 1
        if attempts >= 5:
            block_time = datetime.now() + timedelta(minutes=10)
            login_attempts[ip] = (datetime.now(), attempts, block_time)
            st.error("Too many failed attempts. You are blocked for 10 minutes.")
        else:
            login_attempts[ip] = (datetime.now(), attempts, None)
            st.error(f"😕 Password incorrect. Attempt {attempts} of 5.")
        return False 

# --- Centralized Sidebar Styling and Image ---

def display_sidebar():
    """Displays the sidebar with consistent styling and image."""

    st.markdown(
        """
        <style>
        .cover-glow {
            width: 100%;
            height: auto;
            padding: 3px;
            box-shadow: 
                0 0 5px #330000,
                0 0 10px #660000,
                0 0 15px #990000,
                0 0 20px #CC0000,
                0 0 25px #FF0000,
                0 0 30px #FF3333,
                0 0 35px #FF6666;
            position: relative;
            z-index: -1;
            border-radius: 45px;
        }
        </style>
        """,
        unsafe_allow_html=True,
    )

    img_path = "imgs/sera_ai.png" 
    # Load and encode the image
    with open(img_path, "rb") as img_file:
        img_base64 = base64.b64encode(img_file.read()).decode()

    st.sidebar.markdown(
        f'<img src="data:image/png;base64,{img_base64}" class="cover-glow">',
        unsafe_allow_html=True,
    )
    st.sidebar.markdown("---") 
    st.sidebar.title("Choose Model")

# --- Streamlit App Configuration ---
st.set_page_config(
    page_title="SeraAI - Streamlined Tool",
    page_icon="imgs/sera_ai_fav.png",
    initial_sidebar_state="auto",
    menu_items={
        "Get help": "https://github.com/p-stoneone/SeraAI-Streamlit",
        "Report a bug": "https://github.com/p-stoneone/SeraAI-Streamlit",
        "About": """
            ## SeraAI Tool - Streamlit Assistant
            ### Powered using Gemini Model
            **GitHub**: https://github.com/p-stoneone/SeraAI-Streamlit
            This tool is created to manage all the backend tasks of SeraAI at single place.
        """
    }
)

# --- Display the sidebar ---
display_sidebar()

# Title of the App
st.title("SeraAI - Streamlined Tool")

# --- Authentication ---
if "newsletter_authenticated" not in st.session_state:
    st.session_state["newsletter_authenticated"] = False
if "summary_authenticated" not in st.session_state:
    st.session_state["summary_authenticated"] = False

if not (st.session_state["newsletter_authenticated"] or st.session_state["summary_authenticated"]):
    st.sidebar.markdown("---") 
    st.sidebar.subheader("Authentication")
    password_input = st.text_input("Password", type="password", key="password")
    if st.button("Authenticate"):
        if password_input:
            authenticated_model = check_password(password_input)
            if authenticated_model:
                st.success(f"Authenticated to {authenticated_model}!")

                # Reinitialize session state for the authenticated model
                if authenticated_model == "Newsletter Model":
                    # Initialize Newsletter model session state 
                    if 'pdf_files' not in st.session_state:
                        st.session_state.pdf_files = []
                        st.session_state.fetched_pdfs = []
                        st.session_state.processed_files = set()
                        st.session_state.summaries = {}
                        st.session_state.problematic_files = {}
                        st.session_state.processed = False
                        st.session_state.merged_json = None
                        st.session_state.newsletter_content = None
                        st.session_state.newsletter_title = None
                        st.session_state.newsletter_body = None
                        st.session_state.mongodb_articles = []
                    # ... initialize other Newsletter variables
                elif authenticated_model == "Summary Model":
                    # Initialize Summary model session state
                    if 'uploaded_files' not in st.session_state:
                        st.session_state.uploaded_files = []
                        st.session_state.summaries = {}
                        st.session_state.problematic_files = {}
                        st.session_state.processed = False
                        st.session_state.merged_json = None

                st.rerun()  # Rerun to update UI
            else:
                st.sidebar.warning("Authentication required.")

# --- Model Selection (After Authentication) ---
if st.session_state["newsletter_authenticated"] or st.session_state["summary_authenticated"]:
    selected_model = st.sidebar.radio(
        "Select Model:", 
        ("Newsletter Model", "Summary Model"),
        index = 0 if st.session_state["newsletter_authenticated"] else 1 # Sets the pre-selected index 
    )

    # --- Model Routing ---
    if selected_model == "Newsletter Model" and st.session_state["newsletter_authenticated"]:
        Newsletter.main()
    elif selected_model == "Summary Model" and st.session_state["summary_authenticated"]:
        Summary.main()
    else: 
        st.sidebar.warning("Required Authentication to access this model.")