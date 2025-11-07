import pandas as pd

def _calculate_scores(df):
    metrics = {
        'Literasi Finansial': [
            'I am able to identify risks and discrepancies and view numbers in a complex way',
            'I am able to understand what is behind the numbers',
            'I am able to understand numbers and financial metrics',
            'I am able to understand what drives cash flow and profits',
            "I am able to understand the company's financial statements and some core performance measures",
            'I pay attention to news about the economy as it may affect my family'
        ],
        'Literasi Keuangan Digital': [
            'Awareness about the potential of financial risk in using digital financial provider or fintech, such as the legality of the fintech provider, interest rate and transaction fee',
            'Having experience in using the product and service of fintech for digital payment',
            'Having a good understanding of digital payment products such as E-Debit, E-Credit, E-Money, Mobile/Internet banking, E -wallet',
            'Having a good understanding of digital alternatives',
            'Having a good understanding of digital insurance',
            'Having a good understanding of customer rights and protection as well as the procedure to complain about the service from digital  financial providers'
        ],
        'Investasi Aset': [
            'I am able to recognize a good financial investment',
            'Experience in using the product and service of fintech for financing (loan) and investment',
            'Experience in using the product and service of fintech for asset management',
            'Having a good understanding of product digital asset management'
        ],
        'Pengelolaan Keuangan': [
            'I am able to and divide it accordingly across an allotted period to the right concerned areas',
            'I am able to project the amount of cash that will be available to me in the future',
            'I take part in domestic expense planning',
            'I suggest at home that we keep money aside for emergencies',
            'I am able to search for economic options during financial decision making',
            'I am able to foresee the long term and short-term consequences of the financial decisions I undertake'
        ],
        'Disiplin Finansial': [
            'I am able to plan ahead to avoid impulse spending',
            'I always try to save some money to do things I really like',
            'I always like to negotiate prices when I buy',
            'I keep an eye on promotions and discounts',
            'I like to think thoroughly before deciding to buy something',
            'I like to research prices whenever I buy something'
        ],
        'Sikap Finansial': [
            'I usually have a critical view of the way my friends deal with money',
            'I like to participate in family decision making when we buy something expensive for home',
            'I advise others on money matters',
            'I often do things without giving them much thought',
            'I am impulsive',
            'I say things before I have thought them through',
            'I am able to quickly change my financial decisions as per the changes in circumstance',
            'Appraise of personal risk helps me in better financial decision making',
            'I make sound financial decision by comparing results over the time',
            'I make sound financial decisions by comparing results over expenses involved',
            'Previously used decision strategies help me in better financial decision making'
        ],
        'Kesejahteraan Finansial': [
            'I am becoming financially secure',
            'I am securing my financial future',
            'I will achieve the financial goals that I have set for myself',
            'I have saved (or will be able to save) enough money to last me to the end of my life',
            'Because of my money situation, I feel I will never have the things I want in life',
            'I am behind with my finances',
            'My finances control my life',
            'Whenever I feel in control of my finances, something happens that sets me back',
            'I am unable to enjoy life because I obsess too much about money'
        ]
    }

    negative_polarity_questions = [
        'I often do things without giving them much thought',
        'I am impulsive',
        'I say things before I have thought them through',
        'Because of my money situation, I feel I will never have the things I want in life',
        'I am behind with my finances',
        'My finances control my life',
        'Whenever I feel in control of my finances, something happens that sets me back',
        'I am unable to enjoy life because I obsess too much about money'
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
    df = pd.read_csv('dataset/Sheet2.csv')
    scores = _calculate_scores(df)
    df_anxiety = pd.read_csv('dataset/Sheet1.csv')
    average_anxiety_score = df_anxiety['financial_anxiety_score'].mean()
    return {"scores": scores, "average_anxiety_score": average_anxiety_score}

def get_anxiety_by_category(filter_by='employment_status'):
    df = pd.read_csv('dataset/Sheet1.csv')
    anxiety_by_category = df.groupby(filter_by)['financial_anxiety_score'].mean().round(1).reset_index()
    # Sort by anxiety score in descending order
    anxiety_by_category = anxiety_by_category.sort_values('financial_anxiety_score', ascending=False)
    return {
        'categories': anxiety_by_category[filter_by].tolist(),
        'scores': anxiety_by_category['financial_anxiety_score'].tolist()
    }

def get_filtered_metrics(filter_by, filter_value):
    df1 = pd.read_csv('dataset/Sheet1.csv')
    df2 = pd.read_csv('dataset/Sheet2.csv')

    # MODIFIED: Convert birth_year to an integer at the very beginning.
    # This is the fix.
    if filter_by == 'birth_year':
        try:
            filter_value = int(filter_value)
        except ValueError:
            # Handle cases where the value might not be a valid number
            return {"scores": {}, "average_anxiety_score": 0}

    # Map Sheet1 column names to Sheet2 column names
    column_mapping = {
        'employment_status': 'Job',
        'education_level': 'Last Education',
        'gender': 'Gender',
        'birth_year': 'Year of Birth'
    }
    
    # Map Sheet1 values to Sheet2 values (for education level)
    value_mapping = {
        'Elementary School': 'Elementary School (SD)',
        'Junior High School': 'Junior High School (SMP)',
        'Senior High School': 'Senior High School (SMA)'
    }
    
    # Get the corresponding Sheet2 column name
    sheet2_column = column_mapping.get(filter_by, filter_by)
    
    # Map the filter value if needed
    sheet2_filter_value = value_mapping.get(filter_value, filter_value)
        
    # Filter Sheet1 for anxiety score. This comparison is now number-to-number.
    filtered_df1 = df1[df1[filter_by] == filter_value]
    average_anxiety_score = filtered_df1['financial_anxiety_score'].mean()
    
    # Filter Sheet2 directly using its own columns. This comparison is also number-to-number.
    df_filtered = df2[df2[sheet2_column] == sheet2_filter_value]
    scores = _calculate_scores(df_filtered)

    return {"scores": scores, "average_anxiety_score": average_anxiety_score}