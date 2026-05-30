import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport
from app.main import app

BASE = "http://test"

# ── shared state ────────────────────────────────────────────────
admin_token = ""
user_token = ""
book_id = ""


# ── helpers ─────────────────────────────────────────────────────
async def get_client():
    return AsyncClient(transport=ASGITransport(app=app), base_url=BASE)


# ════════════════════════════════════════════════════════════════
# AUTH TESTS
# ════════════════════════════════════════════════════════════════

@pytest.mark.asyncio
async def test_register_admin():
    global admin_token
    async with await get_client() as client:
        res = await client.post("/api/auth/register", json={
            "name": "Admin User",
            "email": "admin_test@example.com",
            "password": "password123",
            "role": "admin"
        })
        # 201 on fresh DB, 400 if already exists (re-runs)
        assert res.status_code in [201, 400]
        if res.status_code == 201:
            admin_token = res.json()["access_token"]


@pytest.mark.asyncio
async def test_register_user():
    global user_token
    async with await get_client() as client:
        res = await client.post("/api/auth/register", json={
            "name": "Regular User",
            "email": "user_test@example.com",
            "password": "password123",
            "role": "user"
        })
        assert res.status_code in [201, 400]
        if res.status_code == 201:
            user_token = res.json()["access_token"]


@pytest.mark.asyncio
async def test_login_admin():
    global admin_token
    async with await get_client() as client:
        res = await client.post("/api/auth/login", json={
            "email": "admin_test@example.com",
            "password": "password123"
        })
        assert res.status_code == 200
        data = res.json()
        assert "access_token" in data
        assert data["user"]["role"] == "admin"
        admin_token = data["access_token"]


@pytest.mark.asyncio
async def test_login_user():
    global user_token
    async with await get_client() as client:
        res = await client.post("/api/auth/login", json={
            "email": "user_test@example.com",
            "password": "password123"
        })
        assert res.status_code == 200
        user_token = res.json()["access_token"]


@pytest.mark.asyncio
async def test_login_wrong_password():
    async with await get_client() as client:
        res = await client.post("/api/auth/login", json={
            "email": "admin_test@example.com",
            "password": "wrongpassword"
        })
        assert res.status_code == 401


@pytest.mark.asyncio
async def test_get_profile():
    async with await get_client() as client:
        res = await client.get(
            "/api/auth/profile",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert res.status_code == 200
        data = res.json()
        assert data["email"] == "admin_test@example.com"
        assert data["role"] == "admin"


@pytest.mark.asyncio
async def test_get_profile_no_token():
    async with await get_client() as client:
        res = await client.get("/api/auth/profile")
        assert res.status_code == 403


@pytest.mark.asyncio
async def test_register_duplicate_email():
    async with await get_client() as client:
        res = await client.post("/api/auth/register", json={
            "name": "Dup",
            "email": "admin_test@example.com",
            "password": "password123",
            "role": "user"
        })
        assert res.status_code == 400
        assert "already registered" in res.json()["detail"]


@pytest.mark.asyncio
async def test_register_short_password():
    async with await get_client() as client:
        res = await client.post("/api/auth/register", json={
            "name": "Test",
            "email": "short@example.com",
            "password": "123",
            "role": "user"
        })
        assert res.status_code == 422


# ════════════════════════════════════════════════════════════════
# BOOKS TESTS
# ════════════════════════════════════════════════════════════════

@pytest.mark.asyncio
async def test_create_book():
    global book_id
    async with await get_client() as client:
        res = await client.post(
            "/api/books",
            json={
                "title": "Test Book",
                "author": "Test Author",
                "isbn": "978-1234567890",
                "category": "Technology",
                "price": 299.99,
                "published_date": "2024-01-01",
                "description": "A test book",
                "stock": 10
            },
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert res.status_code in [201, 400]
        if res.status_code == 201:
            book_id = res.json()["id"]
            assert res.json()["title"] == "Test Book"


@pytest.mark.asyncio
async def test_get_books():
    async with await get_client() as client:
        res = await client.get(
            "/api/books",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert res.status_code == 200
        data = res.json()
        assert "books" in data
        assert "total" in data
        assert "page" in data
        assert "total_pages" in data
        assert isinstance(data["books"], list)


@pytest.mark.asyncio
async def test_get_books_with_search():
    async with await get_client() as client:
        res = await client.get(
            "/api/books?search=Test",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert res.status_code == 200
        for book in res.json()["books"]:
            assert "test" in book["title"].lower()


@pytest.mark.asyncio
async def test_get_books_with_pagination():
    async with await get_client() as client:
        res = await client.get(
            "/api/books?page=1&limit=5",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert res.status_code == 200
        assert res.json()["page"] == 1
        assert len(res.json()["books"]) <= 5


@pytest.mark.asyncio
async def test_get_book_by_id():
    if not book_id:
        pytest.skip("No book_id available")
    async with await get_client() as client:
        res = await client.get(
            f"/api/books/{book_id}",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert res.status_code == 200
        assert res.json()["id"] == book_id


@pytest.mark.asyncio
async def test_get_book_invalid_id():
    async with await get_client() as client:
        res = await client.get(
            "/api/books/invalid_id",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert res.status_code == 400


@pytest.mark.asyncio
async def test_get_book_not_found():
    async with await get_client() as client:
        res = await client.get(
            "/api/books/664000000000000000000000",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert res.status_code == 404


@pytest.mark.asyncio
async def test_update_book_admin():
    if not book_id:
        pytest.skip("No book_id available")
    async with await get_client() as client:
        res = await client.put(
            f"/api/books/{book_id}",
            json={"price": 399.99, "stock": 20},
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert res.status_code == 200
        assert res.json()["price"] == 399.99
        assert res.json()["stock"] == 20


@pytest.mark.asyncio
async def test_update_book_user_forbidden():
    if not book_id:
        pytest.skip("No book_id available")
    async with await get_client() as client:
        res = await client.put(
            f"/api/books/{book_id}",
            json={"price": 100.00},
            headers={"Authorization": f"Bearer {user_token}"}
        )
        # User cannot edit admin's book
        assert res.status_code == 403


@pytest.mark.asyncio
async def test_get_categories():
    async with await get_client() as client:
        res = await client.get(
            "/api/books/categories",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert res.status_code == 200
        assert "categories" in res.json()
        assert isinstance(res.json()["categories"], list)


@pytest.mark.asyncio
async def test_export_csv():
    async with await get_client() as client:
        res = await client.get(
            "/api/books/export/csv",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert res.status_code == 200
        assert "text/csv" in res.headers["content-type"]


@pytest.mark.asyncio
async def test_create_book_no_auth():
    async with await get_client() as client:
        res = await client.post("/api/books", json={
            "title": "Unauth Book",
            "author": "X",
            "isbn": "978-0000000000",
            "category": "Fiction",
            "price": 100,
            "published_date": "2024-01-01",
            "stock": 1
        })
        assert res.status_code == 403


@pytest.mark.asyncio
async def test_delete_book_user_forbidden():
    if not book_id:
        pytest.skip("No book_id available")
    async with await get_client() as client:
        res = await client.delete(
            f"/api/books/{book_id}",
            headers={"Authorization": f"Bearer {user_token}"}
        )
        assert res.status_code == 403


@pytest.mark.asyncio
async def test_delete_book_admin():
    if not book_id:
        pytest.skip("No book_id available")
    async with await get_client() as client:
        res = await client.delete(
            f"/api/books/{book_id}",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert res.status_code == 204


# ════════════════════════════════════════════════════════════════
# HEALTH
# ════════════════════════════════════════════════════════════════

@pytest.mark.asyncio
async def test_health_check():
    async with await get_client() as client:
        res = await client.get("/health")
        assert res.status_code == 200
        assert res.json()["status"] == "ok"
