import pandas as pd
import psycopg2
from psycopg2.extras import execute_values
import os

# Database connection parameters
DB_PARAMS = {
    'dbname': 'imdb',
    'user': 'imdb',
    'password': 'imdb123',
    'host': 'localhost',
    'port': '5432'  # Using the mapped port for local connection
}

def clean_array_string(s):
    if pd.isna(s):
        return []
    try:
        # Split by semicolon and clean each item
        return [x.strip() for x in s.split(';') if x.strip()]
    except:
        return []

def import_movies():
    # Get the directory of this script
    script_dir = os.path.dirname(os.path.abspath(__file__))

    # Read the CSV file from the same directory as the script
    print("Reading CSV file...")
    csv_path = os.path.join(script_dir, 'imdb_movies.csv')
    df = pd.read_csv(csv_path)

    # Debug: Print the first few rows and data types
    print("\nInitial DataFrame head:")
    print(df.head())
    print("\nDataFrame info:")
    print(df.info())

    # First, let's truncate the existing table to reimport fresh data
    print("\nConnecting to database to truncate existing data...")
    conn = psycopg2.connect(**DB_PARAMS)
    cur = conn.cursor()
    cur.execute("TRUNCATE TABLE movies RESTART IDENTITY")
    conn.commit()

    # Clean and transform data
    print("Cleaning data...")
    df['genres'] = df['genres'].apply(clean_array_string)

    # Ensure name is properly handled
    df['name'] = df['name'].astype(str).apply(lambda x: x.strip())

    # Debug: Print after name cleaning
    print("\nDataFrame after name cleaning:")
    print(df[['name', 'year', 'rating']].head())

    # Convert year to integer, handling errors
    df['year'] = pd.to_numeric(df['year'], errors='coerce')

    # Convert rating to float, handling errors
    df['rating'] = pd.to_numeric(df['rating'], errors='coerce')

    # Convert num_raters and num_reviews to integer
    df['num_raters'] = pd.to_numeric(df['num_raters'], errors='coerce')
    df['num_reviews'] = pd.to_numeric(df['num_reviews'], errors='coerce')

    # Prepare data for insertion
    print("Preparing data for insertion...")
    data = [(
        row['name'],  # Use column access instead of attribute access
        row.year,
        row.movie_rated,
        row.run_length,
        row.genres,
        row.release_date,
        row.rating,
        row.num_raters,
        row.num_reviews
    ) for _, row in df.iterrows()]

    # Debug: Print first few records to be inserted
    print("\nFirst few records to be inserted:")
    for d in data[:3]:
        print(d)

    # Insert data
    print("\nInserting data...")
    insert_query = """
        INSERT INTO movies (
            name, year, movie_rated, run_length, genres,
            release_date, rating, num_raters, num_reviews
        ) VALUES %s
    """
    execute_values(cur, insert_query, data)

    # Commit and close
    conn.commit()
    cur.close()
    conn.close()
    print("Import completed successfully!")

if __name__ == '__main__':
    import_movies()
