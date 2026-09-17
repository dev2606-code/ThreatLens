from fastapi.testclient import TestClient

from backend.app.main import app


client = TestClient(app)


def test_health_check():
    response = client.get("/health")

    assert response.status_code == 200
    assert response.json()["status"] == "healthy"
    assert response.json()["feeds_online"] == 8


def test_dashboard_stats():
    response = client.get("/api/dashboard/stats")
    data = response.json()

    assert response.status_code == 200
    assert "active_indicators" in data
    assert "critical_threats" in data
    assert "open_alerts" in data
    assert "feeds_online" in data


def test_public_registration_is_disabled():
    response = client.post(
        "/api/auth/register",
        json={
            "username": "blocked_test_user",
            "email": "blocked@example.com",
            "password": "TestPassword123",
        },
    )

    assert response.status_code == 403
    assert response.json()["detail"] == (
        "Public registration is disabled"
    )


def test_invalid_login_is_rejected():
    response = client.post(
        "/api/auth/login",
        data={
            "username": "user_that_does_not_exist",
            "password": "WrongPassword123",
        },
    )

    assert response.status_code == 401


def test_create_indicator_requires_authentication():
    response = client.post(
        "/api/indicators",
        json={
            "value": "unauthorized-test.example",
            "indicator_type": "Domain",
            "severity_score": 80,
            "source": "Automated Test",
            "description": "Must be rejected",
        },
    )

    assert response.status_code == 401