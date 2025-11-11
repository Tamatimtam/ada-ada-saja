import pandas as pd
from app.utils.loan_processor import LoanProcessor
from app.utils.engagement_processor import EngagementProcessor
from app.utils.chart_generator import ChartGenerator
import os
from datetime import datetime  # Import the datetime module


def _calculate_scores(df):
    metrics = {
        "Literasi Finansial": [
            "I am able to identify risks and discrepancies and view numbers in a complex way",
            "I am able to understand what is behind the numbers",
            "I am able to understand numbers and financial metrics",
            "I am able to understand what drives cash flow and profits",
            "I am able to understand the company's financial statements and some core performance measures",
            "I pay attention to news about the economy as it may affect my family",
        ],
        "Literasi Keuangan Digital": [
            "Awareness about the potential of financial risk in using digital financial provider or fintech, such as the legality of the fintech provider, interest rate and transaction fee",
            "Having experience in using the product and service of fintech for digital payment",
            "Having a good understanding of digital payment products such as E-Debit, E-Credit, E-Money, Mobile/Internet banking, E -wallet",
            "Having a good understanding of digital alternatives",
            "Having a good understanding of digital insurance",
            "Having a good understanding of customer rights and protection as well as the procedure to complain about the service from digital  financial providers",
        ],
        "Investasi Aset": [
            "I am able to recognize a good financial investment",
            "Experience in using the product and service of fintech for financing (loan) and investment",
            "Experience in using the product and service of fintech for asset management",
            "Having a good understanding of product digital asset management",
        ],
        "Pengelolaan Keuangan": [
            "I am able to and divide it accordingly across an allotted period to the right concerned areas",
            "I am able to project the amount of cash that will be available to me in the future",
            "I take part in domestic expense planning",
            "I suggest at home that we keep money aside for emergencies",
            "I am able to search for economic options during financial decision making",
            "I am able to foresee the long term and short-term consequences of the financial decisions I undertake",
        ],
        "Disiplin Finansial": [
            "I am able to plan ahead to avoid impulse spending",
            "I always try to save some money to do things I really like",
            "I always like to negotiate prices when I buy",
            "I keep an eye on promotions and discounts",
            "I like to think thoroughly before deciding to buy something",
            "I like to research prices whenever I buy something",
        ],
        "Sikap Finansial": [
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
        "Kesejahteraan Finansial": [
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
    }

    negative_polarity_questions = [
        "I often do things without giving them much thought",
        "I am impulsive",
        "I say things before I have thought them through",
        "Because of my money situation, I feel I will never have the things I want in life",
        "I am behind with my finances",
        "My finances control my life",
        "Whenever I feel in control of my finances, something happens that sets me back",
        "I am unable to enjoy life because I obsess too much about money",
    ]

    df_copy = df.copy()
    for question in negative_polarity_questions:
        if question in df_copy.columns:
            df_copy[question] = 5 - df_copy[question]

    scores = {}
    for metric, questions in metrics.items():
        existing_questions = [q for q in questions if q in df_copy.columns]
        if existing_questions:
            metric_scores = df_copy[existing_questions].mean(axis=1)
            avg_score = metric_scores.mean()
            if pd.isna(avg_score):
                scores[metric] = 0
            else:
                scores[metric] = round(((avg_score - 1) / 3) * 100)
        else:
            scores[metric] = 0
    return scores


def get_main_metrics():
    df = pd.read_csv(
        os.path.join(os.path.dirname(__file__), "..", "dataset", "Sheet2.csv")
    )
    scores = _calculate_scores(df)
    df_anxiety = pd.read_csv(
        os.path.join(os.path.dirname(__file__), "..", "dataset", "Sheet1.csv")
    )
    average_anxiety_score = df_anxiety["financial_anxiety_score"].mean()
    return {"scores": scores, "average_anxiety_score": average_anxiety_score}


def normalize_employment(value: str) -> str:
    if pd.isna(value):
        return "Unknown"
    v = str(value).strip().lower()
    mapping = {
        "entrepreneur": "Entrepreneur",
        "enterpreneur": "Entrepreneur",
        "enterpreneur ": "Entrepreneur",
        "private employee": "Private Employee",
        "civil servant/bumn": "Civil Servant/BUMN",
        "civil servant / bumn": "Civil Servant/BUMN",
        "asn/bumn": "Civil Servant/BUMN",
        "student": "Student",
        "not working": "Not Working",
        "unemployed": "Not Working",
        "none": "Unknown",
        "": "Unknown",
    }
    return mapping.get(v, value if value else "Unknown")


def normalize_education(value: str) -> str:
    if pd.isna(value):
        return "Unknown"
    v = str(value).strip()
    edu_map = {
        "Elementary School (SD)": "Elementary School",
        "Junior High School (SMP)": "Junior High School",
        "Senior High School (SMA)": "Senior High School",
        "Diploma I/II/III": "Diploma I/II/III",
        "Bachelor (S1)/Diploma IV": "Bachelor (S1)/Diploma IV",
        "Postgraduate": "Postgraduate",
    }
    return edu_map.get(v, v or "Unknown")


def _apply_normalization_df1(df: pd.DataFrame):
    if "employment_status" in df.columns:
        df["employment_status"] = df["employment_status"].map(normalize_employment)
    if "education_level" in df.columns:
        df["education_level"] = df["education_level"].map(normalize_education)
    return df


def _apply_normalization_df2(df: pd.DataFrame):
    # Sheet2 column names differ
    if "Job" in df.columns:
        df["Job"] = df["Job"].map(normalize_employment)
    if "Last Education" in df.columns:
        df["Last Education"] = df["Last Education"].map(normalize_education)
    return df


def get_anxiety_by_category(filter_by="employment_status"):
    df = pd.read_csv(
        os.path.join(os.path.dirname(__file__), "..", "dataset", "Sheet1.csv")
    )
    df = _apply_normalization_df1(df)

    category_column = filter_by
    if filter_by == "birth_year":
        current_year = 2025  # As per the context of our session
        df["age"] = current_year - df["birth_year"]
        category_column = "age"

    # Ensure string categories for consistency
    if df[category_column].dtype != "object":
        df[category_column] = df[category_column].astype(str)

    anxiety_by_category = (
        df.groupby(category_column)["financial_anxiety_score"]
        .mean()
        .round(1)
        .reset_index()
    ).sort_values("financial_anxiety_score", ascending=False)

    return {
        "categories": anxiety_by_category[category_column].tolist(),
        "scores": anxiety_by_category["financial_anxiety_score"].tolist(),
    }


def get_filtered_metrics(filter_by, filter_value):
    df1 = pd.read_csv(
        os.path.join(os.path.dirname(__file__), "..", "dataset", "Sheet1.csv")
    )
    df2 = pd.read_csv(
        os.path.join(os.path.dirname(__file__), "..", "dataset", "Sheet2.csv")
    )

    df1 = _apply_normalization_df1(df1)
    df2 = _apply_normalization_df2(df2)

    # Handle age filter (birth_year input from UI is age)
    sheet1_filter_value = filter_value
    if filter_by == "birth_year":
        try:
            age = int(str(filter_value).strip())
            current_year = 2025  # As per context
            sheet1_filter_value = current_year - age
        except ValueError:
            return {"scores": {}, "average_anxiety_score": 0}

    column_mapping = {
        "employment_status": "Job",
        "education_level": "Last Education",
        "gender": "Gender",
        "birth_year": "Year of Birth",  # This mapping remains correct
    }

    sheet2_column = column_mapping.get(filter_by, filter_by)

    # Normalize filter value for both datasets
    if filter_by == "employment_status":
        sheet1_filter_value = normalize_employment(sheet1_filter_value)
    if filter_by == "education_level":
        sheet1_filter_value = normalize_education(sheet1_filter_value)

    filtered_df1 = df1[df1[filter_by] == sheet1_filter_value]
    average_anxiety_score = filtered_df1["financial_anxiety_score"].mean()

    sheet2_filter_value = sheet1_filter_value
    filtered_df2 = df2[df2[sheet2_column] == sheet2_filter_value]

    scores = _calculate_scores(filtered_df2)
    return {"scores": scores, "average_anxiety_score": average_anxiety_score}


# --- New functions from Dashboard B ---

NEW_DATASET_PATH = os.path.join(
    os.path.dirname(__file__),
    "..",
    "dataset",
    "dataset_gelarrasa_genzfinancialprofile.csv",
)


class DataLoader:
    def __init__(self, csv_path):
        self.csv_path = csv_path
        self.df = None
        self.category_order = [
            "N/A",
            "<2jt",
            "2-4jt",
            "4-6jt",
            "6-10jt",
            "10-15jt",
            ">15jt",
        ]

    def load_data(self):
        if not os.path.exists(self.csv_path):
            raise FileNotFoundError(f"CSV file not found: {self.csv_path}")
        self.df = pd.read_csv(self.csv_path)

        # Normalize employment_status column to handle variations
        if "employment_status" in self.df.columns:
            self.df["employment_status"] = self.df["employment_status"].map(
                normalize_employment
            )
        if "education_level" in self.df.columns:
            self.df["education_level"] = self.df["education_level"].map(
                normalize_education
            )

        return self.df

    def get_chart_data(self):
        if self.df is None:
            self.load_data()
        income_counts = self.df["avg_income_category"].value_counts()
        expense_counts = self.df["avg_expense_category"].value_counts()
        income_pct = (income_counts / income_counts.sum() * 100).round(2)
        expense_pct = (expense_counts / expense_counts.sum() * 100).round(2)
        viz_data = pd.DataFrame(
            {
                "Income_Count": income_counts,
                "Income_Percentage": income_pct,
                "Expense_Count": expense_counts,
                "Expense_Percentage": expense_pct,
            }
        ).fillna(0)
        existing_categories = [
            cat for cat in self.category_order if cat in viz_data.index
        ]
        viz_data = viz_data.reindex(existing_categories)
        return {
            "categories": list(viz_data.index),
            "income_percentages": viz_data["Income_Percentage"].tolist(),
            "expense_percentages": viz_data["Expense_Percentage"].tolist(),
            "income_counts": viz_data["Income_Count"].astype(int).tolist(),
            "expense_counts": viz_data["Expense_Count"].astype(int).tolist(),
        }

    def get_profession_chart_data(self):
        if self.df is None:
            self.load_data()
        profession_standing = (
            pd.crosstab(
                self.df["employment_status"],
                self.df["financial_standing"],
                normalize="index",
            )
            * 100
        )
        employment_counts = self.df["employment_status"].value_counts()
        profession_standing = profession_standing.reindex(employment_counts.index)
        categories = [
            str(c).strip() if str(c).strip() else "Unknown"
            for c in profession_standing.index.tolist()
        ]
        colors = {"Surplus": "#2ecc71", "Break-even": "#f39c12", "Deficit": "#e74c3c"}
        chart_data = {
            "categories": categories,
            "financial_standings": list(profession_standing.columns),
            "data": {},
            "colors": colors,
            "total_counts": {
                str(k).strip() if str(k).strip() else "Unknown": int(v)
                for k, v in employment_counts.to_dict().items()
            },
        }
        for standing in profession_standing.columns:
            chart_data["data"][standing] = (
                profession_standing[standing].round(1).tolist()
                if standing in profession_standing.columns
                else [0] * len(categories)
            )
        return chart_data

    def get_education_chart_data(self):
        if self.df is None:
            self.load_data()
        education_order = [
            "Elementary School",
            "Junior High School",
            "Senior High School",
            "Diploma I/II/III",
            "Bachelor (S1)/Diploma IV",
            "Postgraduate",
        ]
        education_standing = (
            pd.crosstab(
                self.df["education_level"],
                self.df["financial_standing"],
                normalize="index",
            )
            * 100
        )
        existing_education = [
            edu for edu in education_order if edu in education_standing.index
        ]
        education_standing = education_standing.reindex(existing_education)
        education_counts = self.df["education_level"].value_counts()
        categories = education_standing.index.tolist()
        colors = {"Surplus": "#2ecc71", "Break-even": "#f39c12", "Deficit": "#e74c3c"}
        chart_data = {
            "categories": categories,
            "financial_standings": list(education_standing.columns),
            "data": {},
            "colors": colors,
            "total_counts": education_counts.to_dict(),
        }
        for standing in education_standing.columns:
            chart_data["data"][standing] = (
                education_standing[standing].round(1).tolist()
                if standing in education_standing.columns
                else [0] * len(categories)
            )
        return chart_data

    def get_filtered_loan_overview(self, income_category=None):
        if self.df is None:
            self.load_data()
        return LoanProcessor(self.df).get_filtered_loan_data_by_income(income_category)

    def get_filtered_loan_purpose_data(self, income_category=None):
        if self.df is None:
            self.load_data()
        filtered_df = (
            self.df[self.df["avg_income_category"] == income_category].copy()
            if income_category and income_category != "All"
            else self.df.copy()
        )
        return LoanProcessor(filtered_df).get_loan_purpose_distribution()

    def get_filtered_engagement_data(self, income_category=None):
        if self.df is None:
            self.load_data()
        baseline_data = EngagementProcessor(self.df).get_engagement_distribution()
        if income_category and income_category != "All":
            filtered_df = self.df[
                self.df["avg_income_category"] == income_category
            ].copy()
            filtered_data = EngagementProcessor(
                filtered_df
            ).get_engagement_distribution()
        else:
            filtered_data = baseline_data
        return {"filtered_data": filtered_data, "baseline_kde": baseline_data["kde"]}


def get_visual_analytics_data():
    loader = DataLoader(NEW_DATASET_PATH)
    chart_data = loader.get_chart_data()
    profession_data = loader.get_profession_chart_data()
    education_data = loader.get_education_chart_data()

    return {
        "chart_html": ChartGenerator.create_diverging_bar_chart(chart_data),
        "profession_chart": ChartGenerator.create_profession_chart(profession_data),
        "education_chart": ChartGenerator.create_education_chart(education_data),
    }


def get_filtered_loan_data(category):
    loader = DataLoader(NEW_DATASET_PATH)
    return loader.get_filtered_loan_overview(category)


def get_loan_purpose_data(category):
    loader = DataLoader(NEW_DATASET_PATH)
    return loader.get_filtered_loan_purpose_data(category)


def get_digital_time_data(category):
    loader = DataLoader(NEW_DATASET_PATH)
    return loader.get_filtered_engagement_data(category)
