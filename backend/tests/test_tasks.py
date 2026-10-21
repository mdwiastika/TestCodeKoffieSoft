from datetime import date, timedelta


def test_create_task_success(client):
    res_m = client.post("/members", json={"name": "Alex", "email": "alex@company.com"})
    assert res_m.status_code == 201
    member_id = res_m.json()["id"]

    today = date.today().isoformat()
    response = client.post(
        "/tasks",
        json={
            "title": "Build user onboarding",
            "description": "Step by step onboarding modal",
            "assignee_id": member_id,
            "status": "In Progress",
            "priority": "High",
            "due_date": today,
        },
    )
    assert response.status_code == 201
    data = response.json()
    assert data["title"] == "Build user onboarding"
    assert data["description"] == "Step by step onboarding modal"
    assert data["status"] == "In Progress"
    assert data["priority"] == "High"
    assert data["due_date"] == today
    assert data["assignee_id"] == member_id
    assert data["assignee"]["name"] == "Alex"
    assert "created_at" in data


def test_create_task_defaults(client):
    response = client.post(
        "/tasks",
        json={"title": "Simple task with minimal fields"},
    )
    assert response.status_code == 201
    data = response.json()
    assert data["status"] == "To Do"
    assert data["priority"] == "Medium"
    assert data["assignee_id"] is None
    assert data["due_date"] is None
    assert data["is_overdue"] is False


def test_create_task_invalid_status_422(client):
    response = client.post(
        "/tasks",
        json={"title": "Bad status task", "status": "Not A Real Status"},
    )
    assert response.status_code == 422


def test_create_task_invalid_priority_422(client):
    response = client.post(
        "/tasks",
        json={"title": "Bad priority task", "priority": "Urgent"},
    )
    assert response.status_code == 422


def test_create_task_empty_title_422(client):
    response = client.post(
        "/tasks",
        json={"title": ""},
    )
    assert response.status_code == 422


def test_create_task_nonexistent_assignee_404(client):
    response = client.post(
        "/tasks",
        json={"title": "Ghost assignee task", "assignee_id": 99999},
    )
    assert response.status_code == 404
    assert "not found" in response.json()["detail"].lower()


def test_update_task(client):
    res = client.post("/tasks", json={"title": "Original Title"})
    task_id = res.json()["id"]

    patch_res = client.patch(
        f"/tasks/{task_id}",
        json={"title": "Updated Title", "status": "Done", "priority": "High"},
    )
    assert patch_res.status_code == 200
    data = patch_res.json()
    assert data["title"] == "Updated Title"
    assert data["status"] == "Done"
    assert data["priority"] == "High"


def test_unassign_task(client):
    res_m = client.post("/members", json={"name": "Sam", "email": "sam@company.com"})
    assert res_m.status_code == 201
    member_id = res_m.json()["id"]

    res_t = client.post("/tasks", json={"title": "Assigned Task", "assignee_id": member_id})
    task_id = res_t.json()["id"]
    assert res_t.json()["assignee_id"] == member_id

    patch_res = client.patch(f"/tasks/{task_id}", json={"assignee_id": None})
    assert patch_res.status_code == 200
    assert patch_res.json()["assignee_id"] is None


def test_delete_task(client):
    res = client.post("/tasks", json={"title": "Task to delete"})
    task_id = res.json()["id"]

    del_res = client.delete(f"/tasks/{task_id}")
    assert del_res.status_code == 204

    get_res = client.get(f"/tasks/{task_id}")
    assert get_res.status_code == 404


def test_tasks_filter_and_search(client):
    m1 = client.post("/members", json={"name": "Alice", "email": "a@c.com"}).json()["id"]
    m2 = client.post("/members", json={"name": "Bob", "email": "b@c.com"}).json()["id"]

    client.post("/tasks", json={"title": "Backend API Design", "status": "In Progress", "priority": "High", "assignee_id": m1})
    client.post("/tasks", json={"title": "Frontend Setup", "status": "To Do", "priority": "Medium", "assignee_id": m2})
    client.post("/tasks", json={"title": "Database Optimization", "status": "Done", "priority": "High", "assignee_id": m1})
    client.post("/tasks", json={"title": "Unassigned Cleanup", "status": "To Do", "priority": "Low", "assignee_id": None})

    search_res = client.get("/tasks?search=API")
    assert search_res.status_code == 200
    assert len(search_res.json()) == 1
    assert search_res.json()[0]["title"] == "Backend API Design"

    status_res = client.get("/tasks?status=To Do")
    assert status_res.status_code == 200
    assert len(status_res.json()) == 2

    priority_res = client.get("/tasks?priority=High")
    assert priority_res.status_code == 200
    assert len(priority_res.json()) == 2

    assignee_res = client.get(f"/tasks?assignee_id={m1}")
    assert assignee_res.status_code == 200
    assert len(assignee_res.json()) == 2

    combined_res = client.get(f"/tasks?status=Done&priority=High&assignee_id={m1}")
    assert combined_res.status_code == 200
    assert len(combined_res.json()) == 1
    assert combined_res.json()[0]["title"] == "Database Optimization"
