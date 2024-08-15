import streamlit as st
import base64
import Summary  # Import your Model.py module
import Newsletter  # Import your SeraAI.py module

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

# --- Model Selection ---
selected_model = st.sidebar.radio("Select Model:", ("Newsletter Model", "Summary Model"))
# Title of the App
st.title("SeraAI - Streamlined Tool")
# --- Model Routing ---
if selected_model == "Newsletter Model":
    Newsletter.main()  # Run the main function from Model.py 
else:
    Summary.main()  # Run the main function from SeraAI.py 