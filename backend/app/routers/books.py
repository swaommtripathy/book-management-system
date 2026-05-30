from fastapi import APIRouter, HTTPException, status, Depends, Query
from typing import Optional
from datetime import datetime
from bson import ObjectId
from app.schemas.books import BookCreate, BookUpdate, BookResponse, BooksListResponse
from app.core.security import get_current_user, get_admin_user
from app.db.database import get_database
import math

router = APIRouter(prefix="/api/books", tags=["Books"])


def serialize_book(book: dict) -> dict:
    return {
        "id": str(book["_id"]),
        "title": book["title"],
        "author": book["author"],
        "isbn": book["isbn"],
        "category": book["category"],
        "price": book["price"],
        "published_date": book.get("published_date", ""),
        "description": book.get("description"),
        "cover_image": book.get("cover_image"),
        "stock": book["stock"],
        "created_by": str(book.get("created_by", "")),
        "created_at": book["created_at"],
    }


@router.post("", response_model=BookResponse, status_code=status.HTTP_201_CREATED)
async def create_book(
    payload: BookCreate,
    db=Depends(get_database),
    current_user=Depends(get_current_user),
):
    # Check duplicate ISBN
    existing = await db["books"].find_one({"isbn": payload.isbn})
    if existing:
        raise HTTPException(status_code=400, detail="ISBN already exists")

    book_doc = {
        **payload.model_dump(),
        "created_by": current_user["_id"],
        "created_at": datetime.utcnow(),
    }
    result = await db["books"].insert_one(book_doc)
    book_doc["_id"] = result.inserted_id
    return BookResponse(**serialize_book(book_doc))


@router.get("", response_model=BooksListResponse)
async def get_books(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    search: Optional[str] = Query(None, description="Search by title"),
    category: Optional[str] = Query(None),
    sort_by: Optional[str] = Query("created_at", regex="^(price|published_date|created_at)$"),
    sort_order: Optional[str] = Query("desc", regex="^(asc|desc)$"),
    db=Depends(get_database),
    current_user=Depends(get_current_user),
):
    query = {}
    if search:
        query["title"] = {"$regex": search, "$options": "i"}
    if category:
        query["category"] = {"$regex": category, "$options": "i"}

    sort_direction = -1 if sort_order == "desc" else 1
    skip = (page - 1) * limit

    total = await db["books"].count_documents(query)
    cursor = db["books"].find(query).sort(sort_by, sort_direction).skip(skip).limit(limit)
    books = await cursor.to_list(length=limit)

    return BooksListResponse(
        books=[BookResponse(**serialize_book(b)) for b in books],
        total=total,
        page=page,
        limit=limit,
        total_pages=math.ceil(total / limit) if total > 0 else 1,
    )


@router.get("/categories")
async def get_categories(db=Depends(get_database), current_user=Depends(get_current_user)):
    categories = await db["books"].distinct("category")
    return {"categories": categories}


@router.get("/{book_id}", response_model=BookResponse)
async def get_book(
    book_id: str,
    db=Depends(get_database),
    current_user=Depends(get_current_user),
):
    if not ObjectId.is_valid(book_id):
        raise HTTPException(status_code=400, detail="Invalid book ID")
    book = await db["books"].find_one({"_id": ObjectId(book_id)})
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")
    return BookResponse(**serialize_book(book))


@router.put("/{book_id}", response_model=BookResponse)
async def update_book(
    book_id: str,
    payload: BookUpdate,
    db=Depends(get_database),
    current_user=Depends(get_current_user),
):
    if not ObjectId.is_valid(book_id):
        raise HTTPException(status_code=400, detail="Invalid book ID")
    book = await db["books"].find_one({"_id": ObjectId(book_id)})
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")

    update_data = {k: v for k, v in payload.model_dump().items() if v is not None}
    if not update_data:
        raise HTTPException(status_code=400, detail="No fields to update")

    await db["books"].update_one({"_id": ObjectId(book_id)}, {"$set": update_data})
    updated = await db["books"].find_one({"_id": ObjectId(book_id)})
    return BookResponse(**serialize_book(updated))


@router.delete("/{book_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_book(
    book_id: str,
    db=Depends(get_database),
    current_user=Depends(get_current_user),
):
    if not ObjectId.is_valid(book_id):
        raise HTTPException(status_code=400, detail="Invalid book ID")
    result = await db["books"].delete_one({"_id": ObjectId(book_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Book not found")
