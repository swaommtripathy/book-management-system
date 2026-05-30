from fastapi import APIRouter, HTTPException, status, Depends
from datetime import datetime
from bson import ObjectId
from app.schemas.auth import UserRegister, UserLogin, UserResponse, TokenResponse, MessageResponse
from app.core.security import hash_password, verify_password, create_access_token, get_current_user
from app.db.database import get_database

router = APIRouter(prefix="/api/auth", tags=["Authentication"])


def serialize_user(user: dict) -> dict:
    return {
        "id": str(user["_id"]),
        "name": user["name"],
        "email": user["email"],
        "role": user["role"],
        "created_at": user["created_at"],
    }


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def register(payload: UserRegister, db=Depends(get_database)):
    # Check duplicate email
    existing = await db["users"].find_one({"email": payload.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    user_doc = {
        "name": payload.name,
        "email": payload.email,
        "password": hash_password(payload.password),
        "role": payload.role,
        "created_at": datetime.utcnow(),
    }
    result = await db["users"].insert_one(user_doc)
    user_doc["_id"] = result.inserted_id

    token = create_access_token({"sub": str(result.inserted_id), "role": payload.role})
    return TokenResponse(access_token=token, user=UserResponse(**serialize_user(user_doc)))


@router.post("/login", response_model=TokenResponse)
async def login(payload: UserLogin, db=Depends(get_database)):
    user = await db["users"].find_one({"email": payload.email})
    if not user or not verify_password(payload.password, user["password"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token = create_access_token({"sub": str(user["_id"]), "role": user["role"]})
    return TokenResponse(access_token=token, user=UserResponse(**serialize_user(user)))


@router.get("/profile", response_model=UserResponse)
async def get_profile(current_user=Depends(get_current_user)):
    return UserResponse(**serialize_user(current_user))
