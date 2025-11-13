import pandas as pd
import numpy as np
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


def get_anxiety_by_category(filter_by="employment_status"):
    df = pd.read_csv(
        os.path.join(os.path.dirname(__file__), "..", "dataset", "Sheet1.csv")
    )

    # Normalize employment_status values to handle variations
    if filter_by == "employment_status":
        df["employment_status"] = df["employment_status"].replace(
            {
                "Entrepreneur": "Entrepreneur",
                "entrepreneur": "Entrepreneur",
                "Enterpreneur": "Entrepreneur",  # Handle common typo
                "enterpreneur": "Entrepreneur",
                "Not Working": "Not Working",
                "Student": "Student",
                "Private Employee": "Private Employee",
                "Civil Servant/BUMN": "Civil Servant/BUMN",
            }
        )

    # MODIFIED: Logic to handle age calculation
    category_column = filter_by
    if filter_by == "birth_year":
        current_year = 2025  # As per the context of our session
        df["age"] = current_year - df["birth_year"]
        category_column = "age"

    anxiety_by_category = (
        df.groupby(category_column)["financial_anxiety_score"]
        .mean()
        .round(1)
        .reset_index()
    )
    anxiety_by_category = anxiety_by_category.sort_values(
        "financial_anxiety_score", ascending=False
    )

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

    # Normalize employment_status values in both datasets
    if filter_by == "employment_status":
        df1["employment_status"] = df1["employment_status"].replace(
            {
                "Entrepreneur": "Entrepreneur",
                "entrepreneur": "Entrepreneur",
                "Enterpreneur": "Entrepreneur",
                "enterpreneur": "Entrepreneur",
                "Not Working": "Not Working",
                "Student": "Student",
                "Private Employee": "Private Employee",
                "Civil Servant/BUMN": "Civil Servant/BUMN",
            }
        )
        # Normalize filter_value as well
        filter_value = str(filter_value).replace("Enterpreneur", "Entrepreneur")

    # MODIFIED: This block now handles converting age back to birth year for filtering
    sheet1_filter_value = filter_value
    if filter_by == "birth_year":
        try:
            # The filter_value is an age, e.g., "25"
            age = int(filter_value)
            current_year = 2025  # As per context
            # Convert age back to birth year to filter the original data
            sheet1_filter_value = current_year - age
        except ValueError:
            return {"scores": {}, "average_anxiety_score": 0}

    # Normalize Sheet2 Job values to collapse variants into a single canonical form
    if "Job" in df2.columns:
        df2["Job"] = df2["Job"].astype(str).str.strip()
        # Normalize Civil Servant/BUMN variations (with or without extra descriptors)
        df2["Job"] = df2["Job"].replace(
            {r"^Civil\s*Servant\s*/\s*BUMN(?:.*)?$": "Civil Servant/BUMN"}, regex=True
        )
        # Normalize common variations for other jobs as well
        df2["Job"] = df2["Job"].replace(
            {
                "entrepreneur": "Entrepreneur",
                "Enterpreneur": "Entrepreneur",
                "enterpreneur": "Entrepreneur",
            }
        )

    column_mapping = {
        "employment_status": "Job",
        "education_level": "Last Education",
        "gender": "Gender",
        "birth_year": "Year of Birth",  # This mapping remains correct
    }

    value_mapping = {
        "Elementary School": "Elementary School (SD)",
        "Junior High School": "Junior High School (SMP)",
        "Senior High School": "Senior High School (SMA)",
        "Entrepreneur": "Entrepreneur",  # Add explicit mapping
        "Not Working": "Not Working",
        "Student": "Student",
        "Private Employee": "Private Employee",
        # After normalization, Sheet2 uses 'Civil Servant/BUMN'
        "Civil Servant/BUMN": "Civil Servant/BUMN",
    }

    sheet2_column = column_mapping.get(filter_by, filter_by)
    # The filter value for sheet2 also needs to be the calculated birth year
    sheet2_filter_value = value_mapping.get(
        str(sheet1_filter_value), sheet1_filter_value
    )

    filtered_df1 = df1[df1[filter_by] == sheet1_filter_value]
    average_anxiety_score = filtered_df1["financial_anxiety_score"].mean()

    df_filtered = df2[df2[sheet2_column] == sheet2_filter_value]
    scores = _calculate_scores(df_filtered)

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
            self.df["employment_status"] = self.df["employment_status"].replace(
                {
                    "Entrepreneur": "Entrepreneur",
                    "entrepreneur": "Entrepreneur",
                    "Enterpreneur": "Entrepreneur",
                    "enterpreneur": "Entrepreneur",
                    "Not Working": "Not Working",
                    "Student": "Student",
                    "Private Employee": "Private Employee",
                    "Civil Servant/BUMN": "Civil Servant/BUMN",
                }
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
        categories = profession_standing.index.tolist()
        colors = {"Surplus": "#2ecc71", "Break-even": "#f39c12", "Deficit": "#e74c3c"}
        chart_data = {
            "categories": categories,
            "financial_standings": list(profession_standing.columns),
            "data": {},
            "colors": colors,
            "total_counts": employment_counts.to_dict(),
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

    def get_filtered_profession_chart_data(self, income_category=None):
        if self.df is None:
            self.load_data()

        if income_category and income_category != 'All':
            df_filtered = self.df[self.df['avg_income_category'] == income_category].copy()
        else:
            df_filtered = self.df.copy()

        if df_filtered.empty or 'employment_status' not in df_filtered.columns or 'financial_standing' not in df_filtered.columns:
            return {'categories': [], 'data': {}, 'colors': {}, 'total_counts': {}}

        profession_standing = pd.crosstab(df_filtered['employment_status'], df_filtered['financial_standing'], normalize='index') * 100
        employment_counts = df_filtered['employment_status'].value_counts()
        
        profession_standing = profession_standing.reindex(employment_counts.index)
        
        categories = profession_standing.index.tolist()
        colors = {"Surplus": "#2ecc71", "Break-even": "#f39c12", "Deficit": "#e74c3c"}
        
        chart_data = {
            "categories": categories,
            "financial_standings": list(profession_standing.columns),
            "data": {},
            "colors": colors,
            "total_counts": employment_counts.to_dict()
        }
        for standing in profession_standing.columns:
            chart_data["data"][standing] = profession_standing[standing].round(1).tolist() if standing in profession_standing.columns else [0] * len(categories)
        
        return chart_data

    def get_filtered_education_chart_data(self, income_category=None):
        if self.df is None:
            self.load_data()

        if income_category and income_category != 'All':
            df_filtered = self.df[self.df['avg_income_category'] == income_category].copy()
        else:
            df_filtered = self.df.copy()

        if df_filtered.empty or 'education_level' not in df_filtered.columns or 'financial_standing' not in df_filtered.columns:
            return {'categories': [], 'data': {}, 'colors': {}, 'total_counts': {}}
            
        education_order = [
            "Elementary School", "Junior High School", "Senior High School",
            "Diploma I/II/III", "Bachelor (S1)/Diploma IV", "Postgraduate"
        ]
        education_standing = pd.crosstab(df_filtered['education_level'], df_filtered['financial_standing'], normalize='index') * 100
        
        existing_education = [edu for edu in education_order if edu in education_standing.index]
        education_standing = education_standing.reindex(existing_education)
        
        education_counts = df_filtered['education_level'].value_counts()
        categories = education_standing.index.tolist()
        colors = {"Surplus": "#2ecc71", "Break-even": "#f39c12", "Deficit": "#e74c3c"}
        
        chart_data = {
            "categories": categories,
            "financial_standings": list(education_standing.columns),
            "data": {},
            "colors": colors,
            "total_counts": education_counts.to_dict()
        }
        for standing in education_standing.columns:
            chart_data["data"][standing] = education_standing[standing].round(1).tolist() if standing in education_standing.columns else [0] * len(categories)

        return chart_data

# Add these new functions at the end of app/services.py

def get_profession_data(category):
    loader = DataLoader(NEW_DATASET_PATH)
    return loader.get_filtered_profession_chart_data(category)

def get_education_data(category):
    loader = DataLoader(NEW_DATASET_PATH)
    return loader.get_filtered_education_chart_data(category)

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


# --- Functions for Map Panel ---

def clean_regional_data(df):
    df = df.rename(
        columns={
            "Provinsi": "provinsi",
            "Jumlah Rekening Penerima Pinjaman Aktif (entitas)": "rekening_penerima_aktif",
            "Jumlah Dana yang Diberikan (Rp miliar)": "dana_diberikan_miliar",
            "Jumlah Rekening Pemberi Pinjaman (akun)": "rekening_pemberi",
            "TWP 90%": "twp_90",
            "Jumlah Penerima Pinjaman (akun)": "jumlah_penerima",
            "Outstanding Pinjaman (Rp miliar)": "outstanding_pinjaman_miliar",
            "Jumlah Penduduk (Ribu)": "jumlah_penduduk_ribu",
            "PDRB (Ribu Rp)": "pdrb_ribu_rp",
            "Urbanisasi (%)": "urbanisasi_persen",
        }
    )

    numeric_cols = [
        "rekening_penerima_aktif",
        "dana_diberikan_miliar",
        "rekening_pemberi",
        "twp_90",
        "jumlah_penerima",
        "outstanding_pinjaman_miliar",
        "jumlah_penduduk_ribu",
        "pdrb_ribu_rp",
        "urbanisasi_persen",
    ]

    for col in numeric_cols:
        df[col] = df[col].replace("-", pd.NA)
        if df[col].dtype == "object":
            df[col] = df[col].str.replace(".", "", regex=False)
            df[col] = df[col].str.replace("%", "", regex=False)
            df[col] = df[col].str.replace(",", ".", regex=False)
        df[col] = pd.to_numeric(df[col], errors="coerce")

    return df


def clean_and_aggregate_financial_data(df):
    """Membersihkan dan mengagregasi data profil finansial per provinsi."""
    numeric_cols = [
        "avg_monthly_income (INT)",
        "avg_monthly_expense (INT)",
        "financial_anxiety_score",
        "digital_time_spent_per_day",
    ]
    for col in numeric_cols:
        df[col] = pd.to_numeric(df[col], errors="coerce")

    # Agregasi: mean untuk numerik, mode untuk kategorikal
    agg_functions = {
        "avg_monthly_income (INT)": "mean",
        "avg_monthly_expense (INT)": "mean",
        "financial_anxiety_score": "mean",
        "digital_time_spent_per_day": "mean",
        "main_fintech_app": lambda x: x.mode().iloc[0] if not x.mode().empty else None,
        "investment_type": lambda x: x.mode().iloc[0] if not x.mode().empty else None,
    }

    agg_df = df.groupby("province").agg(agg_functions).reset_index()

    # Hitung persentase pengguna untuk fintech app yang paling populer
    fintech_percentage = []
    for province in agg_df["province"]:
        province_data = df[df["province"] == province]
        if len(province_data) > 0:
            most_popular_app = (
                province_data["main_fintech_app"].mode().iloc[0]
                if not province_data["main_fintech_app"].mode().empty
                else None
            )
            if most_popular_app:
                percentage = (
                    (province_data["main_fintech_app"] == most_popular_app).sum()
                    / len(province_data)
                    * 100
                )
                fintech_percentage.append(round(percentage, 1))
            else:
                fintech_percentage.append(0)
        else:
            fintech_percentage.append(0)

    agg_df["fintech_percentage"] = fintech_percentage

    # Ganti nama kolom agar lebih mudah digunakan di frontend
    agg_df = agg_df.rename(
        columns={
            "province": "provinsi",
            "avg_monthly_income (INT)": "avg_income",
            "avg_monthly_expense (INT)": "avg_expense",
            "financial_anxiety_score": "avg_anxiety_score",
            "digital_time_spent_per_day": "avg_digital_time",
            "main_fintech_app": "mode_fintech_app",
            "investment_type": "mode_investment_type",
        }
    )

    agg_df["financial_balance"] = agg_df["avg_income"] - agg_df["avg_expense"]

    for col in [
        "avg_income",
        "avg_expense",
        "avg_anxiety_score",
        "avg_digital_time",
        "financial_balance",
    ]:
        agg_df[col] = agg_df[col].round(2)

    return agg_df

def get_regional_data_from_file():
    """Endpoint untuk data indikator ekonomi regional."""
    try:
        df = pd.read_csv(os.path.join(os.path.dirname(__file__), "..", "dataset", "Dataset Gelarrasa - Regional_Economic_Indicators.csv"))
        df_cleaned = clean_regional_data(df)
        df_final = df_cleaned.replace({np.nan: None})
        return df_final.to_dict(orient="records")
    except FileNotFoundError:
        return {"error": "File Regional_Economic_Indicators.csv tidak ditemukan"}, 404
    except Exception as e:
        return {"error": str(e)}, 500


def get_financial_data_from_file():
    """Endpoint untuk data profil finansial Gen Z yang sudah diagregasi."""
    try:
        df = pd.read_csv(os.path.join(os.path.dirname(__file__), "..", "dataset", "Dataset Gelarrasa - GenZ_Financial_Profile_map.csv"))
        df_agg = clean_and_aggregate_financial_data(df)
        df_final = df_agg.replace({np.nan: None})
        return df_final.to_dict(orient="records")
    except FileNotFoundError:
        return {"error": "File dataset_gelarrasa_genzfinancialprofile.csv tidak ditemukan"}, 404
    except Exception as e:
        return {"error": str(e)}, 500
