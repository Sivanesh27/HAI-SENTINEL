def test_health_check_returns_200(client):
    """Test healthcheck endpoint returns 200 OK and expected keys."""
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "online"
    assert data["app_name"] == "HAI-Sentinel"
    assert "disclaimer" in data


def test_root_returns_welcome_message(client):
    """Test root endpoint returns 200 OK."""
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert "message" in data
