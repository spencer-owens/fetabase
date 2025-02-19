from langchain_core.prompts import ChatPromptTemplate, SystemMessagePromptTemplate, HumanMessagePromptTemplate
from langchain_openai import ChatOpenAI
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Database schema for our IMDB database
SCHEMA = """
CREATE TABLE movies (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    year INTEGER,
    movie_rated VARCHAR(20),
    run_length VARCHAR(20),
    genres TEXT[],
    release_date VARCHAR(50),
    rating DECIMAL(3,1),
    num_raters INTEGER,
    num_reviews INTEGER,
    created_at TIMESTAMP WITH TIME ZONE
);
"""

def create_sql_query_chain():
    # Initialize the model
    model = ChatOpenAI(
        model="gpt-4-turbo-preview",
        temperature=0
    )

    system_template = """You are an expert SQL query generator. Your task is to convert natural language questions about movies into SQL queries.

    The database contains a single table 'movies' with the following schema:
    {schema}

    Important rules for SQL formatting:
    1. NEVER execute the query, only generate it
    2. Use proper SQL syntax for PostgreSQL
    3. Always format table and column references with double quotes and full schema path:
       - Table reference: "public"."movies"
       - Column reference: "public"."movies"."column_name"
    4. Format the SQL query with proper indentation:
       - Each clause (SELECT, FROM, WHERE, etc.) on a new line
       - Two spaces for indentation
       - Commas at the end of lines for column lists
    5. For aggregations, use meaningful aliases with AS
    6. Handle arrays appropriately:
       - The genres column is TEXT[]
       - When using UNNEST with arrays in complex queries, be careful about duplicates
       - Use DISTINCT when necessary to remove duplicates
       - Consider using subqueries or window functions instead of multiple UNNESTs
       - For genre-based analysis, try to UNNEST only once in the outermost scope
    7. Keep queries efficient and avoid SELECT *

    Example format:
    ```sql
    WITH genre_stats AS (
      SELECT DISTINCT
        UNNEST("public"."movies"."genres") AS "genre",
        "public"."movies"."id",
        "public"."movies"."rating"
      FROM
        "public"."movies"
    )
    SELECT
      "genre",
      AVG("rating") AS "avg_rating",
      COUNT(DISTINCT "id") AS "movie_count"
    FROM
      genre_stats
    GROUP BY
      "genre"
    ORDER BY
      "avg_rating" DESC
    ```

    Return ONLY the SQL query, nothing else."""

    # Create message templates
    system_message_prompt = SystemMessagePromptTemplate.from_template(system_template)
    human_message_prompt = HumanMessagePromptTemplate.from_template("{question}")
    chat_prompt = ChatPromptTemplate.from_messages([system_message_prompt, human_message_prompt])

    async def run_chain(inputs: dict) -> dict:
        # Format messages
        messages = chat_prompt.format_messages(
            schema=SCHEMA,
            question=inputs["question"]
        )

        # Get response
        response = await model.ainvoke(messages)

        return {
            "sql_query": response.content,
            "explanation": "Generated SQL query based on your natural language request."
        }

    return run_chain
