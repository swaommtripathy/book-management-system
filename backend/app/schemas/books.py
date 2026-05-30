from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


class BookCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    author: str = Field(..., min_length=1, max_length=200)
    isbn: str = Field(..., min_length=10, max_length=20)
    category: str = Field(..., min_length=1, max_length=100)
    price: float = Field(..., gt=0)
    published_date: str  # ISO date string
    description: Optional[str] = None
    cover_image: Optional[str] = None
    stock: int = Field(..., ge=0)


class BookUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    author: Optional[str] = Field(None, min_length=1, max_length=200)
    isbn: Optional[str] = Field(None, min_length=10, max_length=20)
    category: Optional[str] = None
    price: Optional[float] = Field(None, gt=0)
    published_date: Optional[str] = None
    description: Optional[str] = None
    cover_image: Optional[str] = None
    stock: Optional[int] = Field(None, ge=0)


class BookResponse(BaseModel):
    id: str
    title: str
    author: str
    isbn: str
    category: str
    price: float
    published_date: str
    description: Optional[str] = None
    cover_image: Optional[str] = None
    stock: int
    created_by: str
    created_at: datetime


class BooksListResponse(BaseModel):
    books: List[BookResponse]
    total: int
    page: int
    limit: int
    total_pages: int
