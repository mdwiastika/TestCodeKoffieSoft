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


def test_tasks_pagination_and_ordering(client):
    for i in range(1, 16):
        client.post("/tasks", json={"title": f"Task #{i:02d}"})

    res = client.get("/tasks?page=1&page_size=10")
    assert res.status_code == 200
    data = res.json()
    assert data["total"] == 15
    assert data["page"] == 1
    assert data["page_size"] == 10
    assert data["total_pages"] == 2
    assert len(data["items"]) == 10
    assert data["items"][0]["title"] == "Task #15"

    res_p2 = client.get("/tasks?page=2&page_size=10")
    assert res_p2.status_code == 200
    data_p2 = res_p2.json()
    assert data_p2["page"] == 2
    assert len(data_p2["items"]) == 5
    assert data_p2["items"][0]["title"] == "Task #05"
    assert data_p2["items"][-1]["title"] == "Task #01"

    res_out = client.get("/tasks?page=99&page_size=10")
    assert res_out.status_code == 200
    assert res_out.json()["items"] == []
    assert res_out.json()["total"] == 15


def test_tasks_invalid_pagination_params_422(client):
    assert client.get("/tasks?page=0").status_code == 422
    assert client.get("/tasks?page_size=0").status_code == 422
    assert client.get("/tasks?page_size=101").status_code == 422


def test_tasks_filter_and_search(client):
    m1 = client.post("/members", json={"name": "Alice", "email": "a@c.com"}).json()["id"]
    m2 = client.post("/members", json={"name": "Bob", "email": "b@c.com"}).json()["id"]

    client.post("/tasks", json={"title": "Backend API Design", "status": "In Progress", "priority": "High", "assignee_id": m1})
    client.post("/tasks", json={"title": "Frontend Setup", "status": "To Do", "priority": "Medium", "assignee_id": m2})
    client.post("/tasks", json={"title": "Database Optimization", "status": "Done", "priority": "High", "assignee_id": m1})
    client.post("/tasks", json={"title": "Unassigned Cleanup", "status": "To Do", "priority": "Low", "assignee_id": None})

    search_res = client.get("/tasks?search=API")
    assert search_res.status_code == 200
    assert search_res.json()["total"] == 1
    assert len(search_res.json()["items"]) == 1
    assert search_res.json()["items"][0]["title"] == "Backend API Design"

    status_res = client.get("/tasks?status=To Do")
    assert status_res.status_code == 200
    assert status_res.json()["total"] == 2
    assert len(status_res.json()["items"]) == 2

    priority_res = client.get("/tasks?priority=High")
    assert priority_res.status_code == 200
    assert priority_res.json()["total"] == 2
    assert len(priority_res.json()["items"]) == 2

    assignee_res = client.get(f"/tasks?assignee_id={m1}")
    assert assignee_res.status_code == 200
    assert assignee_res.json()["total"] == 2
    assert len(assignee_res.json()["items"]) == 2

    combined_res = client.get(f"/tasks?status=Done&priority=High&assignee_id={m1}")
    assert combined_res.status_code == 200
    assert combined_res.json()["total"] == 1
    assert len(combined_res.json()["items"]) == 1
    assert combined_res.json()["items"][0]["title"] == "Database Optimization"


def test_tasks_filter_overdue(client):
    today = date.today()
    past_due = (today - timedelta(days=2)).isoformat()
    future_due = (today + timedelta(days=3)).isoformat()

    client.post("/tasks", json={"title": "Overdue In Progress", "status": "In Progress", "due_date": past_due})
    client.post("/tasks", json={"title": "Past Done Task", "status": "Done", "due_date": past_due})
    client.post("/tasks", json={"title": "Future Task", "status": "To Do", "due_date": future_due})
    client.post("/tasks", json={"title": "No Due Date Task", "status": "To Do", "due_date": None})

    res = client.get("/tasks?is_overdue=true")
    assert res.status_code == 200
    data = res.json()
    assert data["total"] == 1
    assert len(data["items"]) == 1
    assert data["items"][0]["title"] == "Overdue In Progress"

    res_status_alias = client.get("/tasks?status=Overdue")
    assert res_status_alias.status_code == 200
    assert res_status_alias.json()["total"] == 1
    assert res_status_alias.json()["items"][0]["title"] == "Overdue In Progress"

    res_not_overdue = client.get("/tasks?is_overdue=false")
    assert res_not_overdue.status_code == 200
    assert res_not_overdue.json()["total"] == 3

