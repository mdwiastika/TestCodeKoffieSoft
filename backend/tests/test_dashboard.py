from datetime import date, timedelta


def test_empty_dashboard(client):
    response = client.get("/dashboard")
    assert response.status_code == 200
    data = response.json()
    assert data["total"] == 0
    assert data["todo"] == 0
    assert data["in_progress"] == 0
    assert data["done"] == 0
    assert data["overdue"] == 0
    assert data["needs_attention"] == []


def test_dashboard_counts_and_overdue_rule(client):
    today = date.today()
    past_due = (today - timedelta(days=3)).isoformat()
    future_due = (today + timedelta(days=3)).isoformat()
    today_due = today.isoformat()

    client.post("/tasks", json={"title": "Task 1", "status": "To Do", "due_date": past_due})
    client.post("/tasks", json={"title": "Task 2", "status": "In Progress", "due_date": past_due})
    client.post("/tasks", json={"title": "Task 3", "status": "Done", "due_date": past_due})
    client.post("/tasks", json={"title": "Task 4", "status": "To Do", "due_date": today_due})
    client.post("/tasks", json={"title": "Task 5", "status": "In Progress", "due_date": future_due})
    client.post("/tasks", json={"title": "Task 6", "status": "To Do", "due_date": None})
    client.post("/tasks", json={"title": "Task 7", "status": "Done", "due_date": future_due})

    response = client.get("/dashboard")
    assert response.status_code == 200
    data = response.json()

    assert data["total"] == 7
    assert data["todo"] == 3
    assert data["in_progress"] == 2
    assert data["done"] == 2
    assert data["overdue"] == 2

    needs = data["needs_attention"]
    assert len(needs) <= 5
    assert all(t["status"] != "Done" for t in needs)
    assert needs[0]["is_overdue"] is True
    assert needs[1]["is_overdue"] is True


def test_dashboard_needs_attention_max_5(client):
    today = date.today()
    for i in range(10):
        client.post(
            "/tasks",
            json={"title": f"Overdue #{i}", "status": "To Do", "due_date": (today - timedelta(days=i + 1)).isoformat()},
        )

    response = client.get("/dashboard")
    assert response.status_code == 200
    data = response.json()
    assert len(data["needs_attention"]) == 5
