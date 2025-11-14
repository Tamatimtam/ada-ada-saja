import pandas as pd
import numpy as np
from app.utils.loan_processor import LoanProcessor
from app.utils.engagement_processor import EngagementProcessor
from app.utils.chart_generator import ChartGenerator
import os
import re
from urllib.parse import quote, unquote

# --- Data Loading ---
def _load_sheet(file_name):
    path = os.path.join(os.path.dirname(__file__), "..", "dataset", file_name)
    return pd.read_csv(path)

# --- Metric Calculation Logic (Restored 'title' for deep dive compatibility) ---
METRICS_CONFIG = {
    "Literasi Finansial": {
        "card": "knowledge",
        "title": "Financial Knowledge", # Restored
        "questions": [
            "I am able to identify risks and discrepancies and view numbers in a complex way",
            "I am able to understand what is behind the numbers",
            "I am able to understand numbers and financial metrics",
            "I am able to understand what drives cash flow and profits",
            "I am able to understand the company's financial statements and some core performance measures",
            "I pay attention to news about the economy as it may affect my family",
        ],
    },
    "Literasi Keuangan Digital": {
        "card": "knowledge",
        "title": "Financial Knowledge", # Restored
        "questions": [
            "Awareness about the potential of financial risk in using digital financial provider or fintech, such as the legality of the fintech provider, interest rate and transaction fee",
            "Having experience in using the product and service of fintech for digital payment",
            "Having a good understanding of digital payment products such as E-Debit, E-Credit, E-Money, Mobile/Internet banking, E -wallet",
            "Having a good understanding of digital alternatives",
            "Having a good understanding of digital insurance",
            "Having a good understanding of customer rights and protection as well as the procedure to complain about the service from digital  financial providers",
        ],
    },
    "Pengelolaan Keuangan": {
        "card": "behavior",
        "title": "Financial Behavior", # Restored
        "questions": [
            "I am able to and divide it accordingly across an allotted period to the right concerned areas",
            "I am able to project the amount of cash that will be available to me in the future",
            "I take part in domestic expense planning",
            "I suggest at home that we keep money aside for emergencies",
            "I am able to search for economic options during financial decision making",
            "I am able to foresee the long term and short-term consequences of the financial decisions I undertake",
        ],
    },
    "Sikap Finansial": {
        "card": "behavior",
        "title": "Financial Behavior", # Restored
        "questions": [
            "I usually have a critical view of the way my friends deal with money",
            "I like to participate in family decision making when we buy something expensive for home",
            "I advise others on money matters",
            "I often do things without giving them much thought",
            "I am impulsive",
            "I say things before I have thought them through",
            "I am able to quickly change my financial decisions as per the changes in circumstance",
            "Appraise of personal risk helps me in better financial decision making",
            "I make sound financial decision by comparing results over the time",
            "I make sound financial decisions by comparing results over expenses involved",
            "Previously used decision strategies help me in better financial decision making",
        ],
    },
    "Disiplin Finansial": {
        "card": "behavior",
        "title": "Financial Behavior", # Restored
        "questions": [
            "I am able to plan ahead to avoid impulse spending",
            "I always try to save some money to do things I really like",
            "I always like to negotiate prices when I buy",
            "I keep an eye on promotions and discounts",
            "I like to think thoroughly before deciding to buy something",
            "I like to research prices whenever I buy something",
        ],
    },
    "Kesejahteraan Finansial": {
        "card": "wellbeing",
        "title": "Financial Wellbeing", # Restored
        "questions": [
            "I am becoming financially secure",
            "I am securing my financial future",
            "I will achieve the financial goals that I have set for myself",
            "I have saved (or will be able to save) enough money to last me to the end of my life",
            "Because of my money situation, I feel I will never have the things I want in life",
            "I am behind with my finances",
            "My finances control my life",
            "Whenever I feel in control of my finances, something happens that sets me back",
            "I am unable to enjoy life because I obsess too much about money",
        ],
    },
    "Investasi Aset": {
        "card": "wellbeing",
        "title": "Financial Wellbeing", # Restored
        "questions": [
            "I am able to recognize a good financial investment",
            "Experience in using the product and service of fintech for financing (loan) and investment",
            "Experience in using the product and service of fintech for asset management",
            "Having a good understanding of product digital asset management",
        ],
    },
}

NEGATIVE_POLARITY_QUESTIONS = [
    "I often do things without giving them much thought",
    "I am impulsive",
    "I say things before I have thought them through",
    "Because of my money situation, I feel I will never have the things I want in life",
    "I am behind with my finances",
    "My finances control my life",
    "Whenever I feel in control of my finances, something happens that sets me back",
    "I am unable to enjoy life because I obsess too much about money",
]

def _calculate_scores(df):
    if df.empty:
        return {metric: 0 for metric in METRICS_CONFIG.keys()}

    df_copy = df.copy()
    for question in NEGATIVE_POLARITY_QUESTIONS:
        if question in df_copy.columns:
            df_copy[question] = 5 - df_copy[question]

    scores = {}
    for metric, config in METRICS_CONFIG.items():
        questions = config["questions"]
        existing_questions = [q for q in questions if q in df_copy.columns]
        if existing_questions:
            metric_scores = df_copy[existing_questions].mean(axis=1)
            avg_score = metric_scores.mean()
            scores[metric] = round(((avg_score - 1) / 3) * 100) if pd.notna(avg_score) else 0
        else:
            scores[metric] = 0
    return scores

def get_main_metrics():
    df_sheet2 = _load_sheet("Sheet2.csv")
    df_sheet1 = _load_sheet("Sheet1.csv")
    scores = _calculate_scores(df_sheet2)
    average_anxiety_score = df_sheet1["financial_anxiety_score"].mean()
    return {"scores": scores, "average_anxiety_score": average_anxiety_score}

# --- MERGED DEEP DIVE LOGIC ---

def _build_deep_dive_structure(scores_data):
    """Helper function to build the nested dictionary for the modal (Restored from old code)."""
    def create_question_id(q_text):
        safe_text = re.sub(r'[^a-zA-Z0-9\s]', '', q_text)
        return quote(safe_text.lower().replace(" ", "-")[:50])

    metrics_data = {}
    for metric, config in METRICS_CONFIG.items():
        question_list = []
        for i, q_text in enumerate(config["questions"]):
            question_list.append({
                "id": create_question_id(q_text),
                "text": q_text,
                "is_negative": q_text in NEGATIVE_POLARITY_QUESTIONS,
                "number": i + 1,
            })
        
        metrics_data[metric] = {
            "score": scores_data.get(metric, 0),
            "card": config["card"],
            "title": config["title"], # Depends on "title" in METRICS_CONFIG
            "questions": question_list
        }
    return metrics_data

def get_metrics_deep_dive():
    """Gets the deep dive data for the entire dataset."""
    df_sheet2 = _load_sheet("Sheet2.csv")
    scores = _calculate_scores(df_sheet2)
    return _build_deep_dive_structure(scores)

def _get_filtered_dataframe(filter_by, filter_value):
    """Filters Sheet2 based on a filter from Sheet1 (Restored from old code)."""
    df1 = _load_sheet("Sheet1.csv")
    df2 = _load_sheet("Sheet2.csv")

    if filter_by == "employment_status":
        df1["employment_status"] = df1["employment_status"].replace({"Enterpreneur": "Entrepreneur", "enterpreneur": "Entrepreneur"})
        filter_value = str(filter_value).replace("Enterpreneur", "Entrepreneur")

    sheet1_filter_value = filter_value
    if filter_by == "birth_year":
        try:
            age = int(filter_value)
            sheet1_filter_value = 2025 - age
        except ValueError:
            return pd.DataFrame(), pd.DataFrame()

    filtered_df1 = df1[df1[filter_by] == sheet1_filter_value]
    
    column_mapping = {"employment_status": "Job", "education_level": "Last Education", "gender": "Gender", "birth_year": "Year of Birth"}
    value_mapping = {"Elementary School": "Elementary School (SD)", "Junior High School": "Junior High School (SMP)", "Senior High School": "Senior High School (SMA)"}
    
    sheet2_column = column_mapping.get(filter_by, filter_by)
    sheet2_filter_value = value_mapping.get(str(sheet1_filter_value), sheet1_filter_value)
    
    df_filtered_sheet2 = df2[df2[sheet2_column] == sheet2_filter_value]
    
    return filtered_df1, df_filtered_sheet2

def get_filtered_metrics_deep_dive(filter_by, filter_value):
    """Gets the deep dive data for a specific filtered group (Restored from old code)."""
    _, df_filtered_sheet2 = _get_filtered_dataframe(filter_by, filter_value)
    filtered_scores = _calculate_scores(df_filtered_sheet2)
    return _build_deep_dive_structure(filtered_scores)

# --- MODIFIED: Question distribution with restored filtering logic ---
def get_question_distribution_data(question_text, filter_by=None, filter_value=None):
    df2 = _load_sheet("Sheet2.csv")

    # Apply filters if they are provided
    if filter_by and filter_value:
        # Use the restored helper function to get the correct slice of data
        _, df2 = _get_filtered_dataframe(filter_by, unquote(filter_value))

    if question_text not in df2.columns:
        return {"error": "Question not found in the dataset"}, 404
    
    counts = df2[question_text].value_counts().to_dict()
    distribution = {str(int(i)): counts.get(i, 0) for i in range(1, 5)}
    most_common = max(distribution, key=distribution.get) if distribution and sum(distribution.values()) > 0 else None

    return {"distribution": distribution, "most_common": most_common}

def get_anxiety_by_category(filter_by="employment_status"):
    df = _load_sheet("Sheet1.csv")
    if filter_by == "employment_status":
        df["employment_status"] = df["employment_status"].replace({"Enterpreneur": "Entrepreneur", "enterpreneur": "Entrepreneur"})
    
    category_column = filter_by
    if filter_by == "birth_year":
        current_year = 2025
        df["age"] = current_year - df["birth_year"]
        category_column = "age"

    anxiety_by_category = df.groupby(category_column)["financial_anxiety_score"].mean().round(1).reset_index()
    anxiety_by_category = anxiety_by_category.sort_values("financial_anxiety_score", ascending=False)
    
    return {"categories": anxiety_by_category[category_column].tolist(), "scores": anxiety_by_category["financial_anxiety_score"].tolist()}

def get_filtered_metrics(filter_by, filter_value):
    # This function now uses the restored helper function for consistency
    filtered_df1, df_filtered_sheet2 = _get_filtered_dataframe(filter_by, filter_value)
    
    average_anxiety_score = filtered_df1["financial_anxiety_score"].mean()
    scores = _calculate_scores(df_filtered_sheet2)

    return {"scores": scores, "average_anxiety_score": average_anxiety_score}

# --- REFACTORED DATA LOADING AND PROCESSING (FROM NEW CODE) ---
NEW_DATASET_PATH = os.path.join(
    os.path.dirname(__file__), "..", "dataset", "dataset_gelarrasa_genzfinancialprofile.csv",
)

class DataLoader:
    # This class is from your new, improved codebase and remains unchanged.
    def __init__(self, csv_path):
        self.csv_path = csv_path
        self.df = None
        self.category_order = [
            "N/A", "<2jt", "2-4jt", "4-6jt", "6-10jt", "10-15jt", ">15jt",
        ]

    def load_data(self):
        if self.df is not None: return self.df
        if not os.path.exists(self.csv_path): raise FileNotFoundError(f"CSV file not found: {self.csv_path}")
        self.df = pd.read_csv(self.csv_path)
        cols_to_clean = ["avg_monthly_income", "avg_monthly_expense", "outstanding_loan"]
        for col in cols_to_clean:
            if col in self.df.columns and self.df[col].dtype == "object":
                self.df[col] = self.df[col].astype(str).str.replace(r"[^\d]", "", regex=True)
                self.df[col] = pd.to_numeric(self.df[col], errors="coerce")
        if "employment_status" in self.df.columns:
            self.df["employment_status"] = self.df["employment_status"].replace({
                "Entrepreneur": "Entrepreneur", "entrepreneur": "Entrepreneur", "Enterpreneur": "Entrepreneur", 
                "enterpreneur": "Entrepreneur", "Not Working": "Not Working", "Student": "Student", 
                "Private Employee": "Private Employee", "Civil Servant/BUMN": "Civil Servant/BUMN", "Others": "Others",
            })
        return self.df

    def _get_filtered_df(self, filter_type=None, filter_value=None):
        if self.df is None: self.load_data()
        if not filter_type or not filter_value or filter_value == 'All': return self.df.copy()
        if filter_type == 'income': return self.df[self.df['avg_income_category'] == filter_value].copy()
        if filter_type == 'expense': return self.df[self.df['avg_expense_category'] == filter_value].copy()
        return self.df.copy()

    def get_chart_data(self):
        if self.df is None: self.load_data()
        income_counts = self.df["avg_income_category"].value_counts()
        expense_counts = self.df["avg_expense_category"].value_counts()
        income_pct = (income_counts / income_counts.sum() * 100).round(2)
        expense_pct = (expense_counts / expense_counts.sum() * 100).round(2)
        viz_data = pd.DataFrame({
            "Income_Count": income_counts, "Income_Percentage": income_pct,
            "Expense_Count": expense_counts, "Expense_Percentage": expense_pct,
        }).fillna(0)
        existing_categories = [cat for cat in self.category_order if cat in viz_data.index]
        viz_data = viz_data.reindex(existing_categories)
        return {
            "categories": list(viz_data.index), "income_percentages": viz_data["Income_Percentage"].tolist(),
            "expense_percentages": viz_data["Expense_Percentage"].tolist(), "income_counts": viz_data["Income_Count"].astype(int).tolist(),
            "expense_counts": viz_data["Expense_Count"].astype(int).tolist(),
        }

    def get_filtered_profession_chart_data(self, filter_type=None, filter_value=None):
        df_filtered = self._get_filtered_df(filter_type, filter_value)
        if df_filtered.empty or "employment_status" not in df_filtered.columns or "financial_standing" not in df_filtered.columns:
            return {"categories": [], "data": {}, "colors": {}, "total_counts": {}, "total_respondents": 0}
        counts_df = pd.crosstab(df_filtered['employment_status'], df_filtered['financial_standing'])
        profession_standing = counts_df.div(counts_df.sum(axis=1), axis=0).fillna(0) * 100
        employment_counts = df_filtered['employment_status'].value_counts()
        profession_standing = profession_standing.reindex(employment_counts.index)
        categories = profession_standing.index.tolist()
        colors = {"Surplus": "#2ecc71", "Break-even": "#f39c12", "Deficit": "#e74c3c"}
        chart_data = {
            "categories": categories, "financial_standings": list(profession_standing.columns),
            "data": {}, "colors": colors, "total_counts": employment_counts.to_dict(),
            "total_respondents": int(df_filtered.shape[0])
        }
        for standing in ["Surplus", "Break-even", "Deficit"]:
            chart_data["data"][standing] = profession_standing[standing].round(1).tolist() if standing in profession_standing.columns else [0] * len(categories)
        return chart_data

    def get_filtered_education_chart_data(self, filter_type=None, filter_value=None):
        df_filtered = self._get_filtered_df(filter_type, filter_value)
        if df_filtered.empty or "education_level" not in df_filtered.columns or "financial_standing" not in df_filtered.columns:
            return {"categories": [], "data": {}, "colors": {}, "total_counts": {}, "total_respondents": 0}
        education_order = [
            "Elementary School", "Junior High School", "Senior High School",
            "Diploma I/II/III", "Bachelor (S1)/Diploma IV", "Postgraduate",
        ]
        counts_df = pd.crosstab(df_filtered['education_level'], df_filtered['financial_standing'])
        education_standing = counts_df.div(counts_df.sum(axis=1), axis=0).fillna(0) * 100
        existing_education = [edu for edu in education_order if edu in education_standing.index]
        education_standing = education_standing.reindex(existing_education)
        education_counts = df_filtered["education_level"].value_counts()
        categories = education_standing.index.tolist()
        colors = {"Surplus": "#2ecc71", "Break-even": "#f39c12", "Deficit": "#e74c3c"}
        chart_data = {
            "categories": categories, "financial_standings": list(education_standing.columns),
            "data": {}, "colors": colors, "total_counts": education_counts.to_dict(),
            "total_respondents": int(df_filtered.shape[0])
        }
        for standing in ["Surplus", "Break-even", "Deficit"]:
            chart_data["data"][standing] = education_standing[standing].round(1).tolist() if standing in education_standing.columns else [0] * len(categories)
        return chart_data

    def get_filtered_loan_overview(self, filter_type=None, filter_value=None):
        filtered_df = self._get_filtered_df(filter_type, filter_value)
        return LoanProcessor(filtered_df).get_filtered_loan_data(filter_type, filter_value)

    def get_filtered_loan_purpose_data(self, filter_type=None, filter_value=None):
        filtered_df = self._get_filtered_df(filter_type, filter_value)
        return LoanProcessor(filtered_df).get_loan_purpose_distribution()

    def get_filtered_engagement_data(self, filter_type=None, filter_value=None):
        baseline_df = self._get_filtered_df()
        filtered_df = self._get_filtered_df(filter_type, filter_value)
        baseline_data = EngagementProcessor(baseline_df).get_engagement_distribution()
        filtered_data = EngagementProcessor(filtered_df).get_engagement_distribution()
        return {"filtered_data": filtered_data, "baseline_kde": baseline_data["kde"]}
    
def get_visual_analytics_data():
    loader = DataLoader(NEW_DATASET_PATH)
    chart_data = loader.get_chart_data()
    profession_data = loader.get_filtered_profession_chart_data()
    education_data = loader.get_filtered_education_chart_data()
    return {
        "chart_html": ChartGenerator.create_diverging_bar_chart(chart_data),
        "profession_chart": ChartGenerator.create_profession_chart(profession_data),
        "education_chart": ChartGenerator.create_education_chart(education_data),
    }

def get_filtered_loan_data(filter_type, filter_value):
    loader = DataLoader(NEW_DATASET_PATH)
    return loader.get_filtered_loan_overview(filter_type, filter_value)

def get_loan_purpose_data(filter_type, filter_value):
    loader = DataLoader(NEW_DATASET_PATH)
    return loader.get_filtered_loan_purpose_data(filter_type, filter_value)

def get_digital_time_data(filter_type, filter_value):
    loader = DataLoader(NEW_DATASET_PATH)
    return loader.get_filtered_engagement_data(filter_type, filter_value)

def get_profession_data(filter_type, filter_value):
    loader = DataLoader(NEW_DATASET_PATH)
    return loader.get_filtered_profession_chart_data(filter_type, filter_value)

def get_education_data(filter_type, filter_value):
    loader = DataLoader(NEW_DATASET_PATH)
    return loader.get_filtered_education_chart_data(filter_type, filter_value)

def clean_regional_data(df):
    df = df.rename(columns={
        "Provinsi": "provinsi", "Jumlah Rekening Penerima Pinjaman Aktif (entitas)": "rekening_penerima_aktif",
        "Jumlah Dana yang Diberikan (Rp miliar)": "dana_diberikan_miliar", "Jumlah Rekening Pemberi Pinjaman (akun)": "rekening_pemberi",
        "TWP 90%": "twp_90", "Jumlah Penerima Pinjaman (akun)": "jumlah_penerima",
        "Outstanding Pinjaman (Rp miliar)": "outstanding_pinjaman_miliar", "Jumlah Penduduk (Ribu)": "jumlah_penduduk_ribu",
        "PDRB (Ribu Rp)": "pdrb_ribu_rp", "Urbanisasi (%)": "urbanisasi_persen",
    })
    numeric_cols = [
        "rekening_penerima_aktif", "dana_diberikan_miliar", "rekening_pemberi", "twp_90", "jumlah_penerima",
        "outstanding_pinjaman_miliar", "jumlah_penduduk_ribu", "pdrb_ribu_rp", "urbanisasi_persen",
    ]
    for col in numeric_cols:
        df[col] = df[col].replace("-", pd.NA)
        if df[col].dtype == "object":
            df[col] = df[col].str.replace(".", "", regex=False).str.replace("%", "", regex=False).str.replace(",", ".", regex=False)
        df[col] = pd.to_numeric(df[col], errors="coerce")
    return df

def clean_and_aggregate_financial_data(df):
    numeric_cols = ["avg_monthly_income (INT)", "avg_monthly_expense (INT)", "financial_anxiety_score", "digital_time_spent_per_day"]
    for col in numeric_cols: df[col] = pd.to_numeric(df[col], errors="coerce")
    agg_functions = {
        "avg_monthly_income (INT)": "mean", "avg_monthly_expense (INT)": "mean",
        "financial_anxiety_score": "mean", "digital_time_spent_per_day": "mean",
        "main_fintech_app": lambda x: x.mode().iloc[0] if not x.mode().empty else None,
        "investment_type": lambda x: x.mode().iloc[0] if not x.mode().empty else None,
    }
    agg_df = df.groupby("province").agg(agg_functions).reset_index()
    fintech_percentage = []
    for province in agg_df["province"]:
        province_data = df[df["province"] == province]
        if not province_data.empty:
            most_popular_app = province_data["main_fintech_app"].mode().iloc[0] if not province_data["main_fintech_app"].mode().empty else None
            if most_popular_app:
                percentage = ((province_data["main_fintech_app"] == most_popular_app).sum() / len(province_data) * 100)
                fintech_percentage.append(round(percentage, 1))
            else: fintech_percentage.append(0)
        else: fintech_percentage.append(0)
    agg_df["fintech_percentage"] = fintech_percentage
    agg_df = agg_df.rename(columns={
        "province": "provinsi", "avg_monthly_income (INT)": "avg_income", "avg_monthly_expense (INT)": "avg_expense",
        "financial_anxiety_score": "avg_anxiety_score", "digital_time_spent_per_day": "avg_digital_time",
        "main_fintech_app": "mode_fintech_app", "investment_type": "mode_investment_type",
    })
    agg_df["financial_balance"] = agg_df["avg_income"] - agg_df["avg_expense"]
    for col in ["avg_income", "avg_expense", "avg_anxiety_score", "avg_digital_time", "financial_balance"]:
        agg_df[col] = agg_df[col].round(2)
    return agg_df

def get_regional_data_from_file():
    try:
        df = pd.read_csv(os.path.join(os.path.dirname(__file__), "..", "dataset", "Dataset Gelarrasa - Regional_Economic_Indicators.csv"))
        df_cleaned = clean_regional_data(df)
        df_final = df_cleaned.replace({np.nan: None})
        return df_final.to_dict(orient="records")
    except FileNotFoundError:
        return {"error": "File Regional_Economic_Indicators.csv tidak ditemukan"}, 404
    except Exception as e:
        return {"error": str(e)}, 500

def get_financial_data_from_file(filter_type=None, filter_value=None):
    try:
        loader = DataLoader(NEW_DATASET_PATH)
        df = loader._get_filtered_df(filter_type, filter_value)
        if df.empty: return []
        df_renamed = df.rename(columns={
            "avg_monthly_income": "avg_monthly_income (INT)",
            "avg_monthly_expense": "avg_monthly_expense (INT)",
        })
        df_agg = clean_and_aggregate_financial_data(df_renamed)
        df_final = df_agg.replace({np.nan: None})
        return df_final.to_dict(orient="records")
    except FileNotFoundError:
        return {"error": "File dataset_gelarrasa_genzfinancialprofile.csv tidak ditemukan"}, 404
    except Exception as e:
        return {"error": str(e)}, 500