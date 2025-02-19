from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import os
from dotenv import load_dotenv

from .nl_to_sql import create_sql_query_chain

# Load environment variables
load_dotenv()

app = FastAPI(title="Natural Language to SQL API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with actual origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class QueryRequest(BaseModel):
    question: str
    context: Optional[str] = None

class QueryResponse(BaseModel):
    sql_query: str
    explanation: Optional[str] = None

@app.post("/api/nl-to-sql", response_model=QueryResponse)
async def natural_language_to_sql(request: QueryRequest):
    try:
        # Create the chain
        chain = create_sql_query_chain()

        # Run the chain
        result = await chain({
            "question": request.question,
            "context": request.context or ""
        })

        return QueryResponse(
            sql_query=result["sql_query"],
            explanation=result.get("explanation")
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
async def health_check():
    return {"status": "healthy"}
