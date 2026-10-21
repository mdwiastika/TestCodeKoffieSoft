def test_create_member_success(client):
    response = client.post(
        "/members",
        json={"name": "Sarah Connor", "email": "sarah@example.com"},
    )
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "Sarah Connor"
    assert data["email"] == "sarah@example.com"
    assert "id" in data
    assert "created_at" in data


def test_create_member_duplicate_email_409(client):
    client.post("/members", json={"name": "Sarah Connor", "email": "sarah@example.com"})
    response = client.post(
        "/members",
        json={"name": "Another Sarah", "email": "sarah@example.com"},
    )
    assert response.status_code == 409
    assert "already exists" in response.json()["detail"]


def test_create_member_invalid_email_422(client):
    response = client.post(
        "/members",
        json={"name": "Invalid Email", "email": "not-an-email"},
    )
    assert response.status_code == 422


def test_create_member_empty_name_422(client):
    response = client.post(
        "/members",
        json={"name": "", "email": "valid@domain.com"},
    )
    assert response.status_code == 422


def test_list_members_pagination_and_ordering(client):
    client.post("/members", json={"name": "Bob", "email": "bob@domain.com"})
    client.post("/members", json={"name": "Alice", "email": "alice@domain.com"})
    client.post("/members", json={"name": "Charlie", "email": "charlie@domain.com"})

    res = client.get("/members?page=1&page_size=2")
    assert res.status_code == 200
    data = res.json()
    assert data["total"] == 3
    assert data["page"] == 1
    assert data["page_size"] == 2
    assert data["total_pages"] == 2
    assert len(data["items"]) == 2
    assert data["items"][0]["name"] == "Alice"
    assert data["items"][1]["name"] == "Bob"

    res_page_2 = client.get("/members?page=2&page_size=2")
    assert res_page_2.status_code == 200
    data_2 = res_page_2.json()
    assert data_2["page"] == 2
    assert len(data_2["items"]) == 1
    assert data_2["items"][0]["name"] == "Charlie"

    res_out_of_range = client.get("/members?page=99&page_size=2")
    assert res_out_of_range.status_code == 200
    data_out = res_out_of_range.json()
    assert data_out["items"] == []
    assert data_out["total"] == 3


def test_list_members_invalid_pagination_params_422(client):
    assert client.get("/members?page=0").status_code == 422
    assert client.get("/members?page_size=0").status_code == 422
    assert client.get("/members?page_size=101").status_code == 422


def test_get_member_options(client):
    client.post("/members", json={"name": "Zoe", "email": "zoe@domain.com"})
    client.post("/members", json={"name": "Adam", "email": "adam@domain.com"})

    res = client.get("/members/options")
    assert res.status_code == 200
    data = res.json()
    assert isinstance(data, list)
    assert len(data) == 2
    assert data[0]["name"] == "Adam"
    assert data[1]["name"] == "Zoe"
    assert "id" in data[0]
    assert "email" not in data[0]


def test_get_member_by_id(client):
    res = client.post("/members", json={"name": "John", "email": "john@domain.com"})
    member_id = res.json()["id"]

    get_res = client.get(f"/members/{member_id}")
    assert get_res.status_code == 200
    assert get_res.json()["id"] == member_id

    not_found = client.get("/members/99999")
    assert not_found.status_code == 404


def test_update_member(client):
    res = client.post("/members", json={"name": "Old Name", "email": "old@domain.com"})
    member_id = res.json()["id"]

    up_res = client.patch(f"/members/{member_id}", json={"name": "New Name"})
    assert up_res.status_code == 200
    assert up_res.json()["name"] == "New Name"
    assert up_res.json()["email"] == "old@domain.com"

    client.post("/members", json={"name": "Other", "email": "other@domain.com"})
    dup_res = client.patch(f"/members/{member_id}", json={"email": "other@domain.com"})
    assert dup_res.status_code == 409


def test_delete_member_and_set_null_on_tasks(client):
    res_m = client.post("/members", json={"name": "Dev", "email": "dev@domain.com"})
    member_id = res_m.json()["id"]

    res_t = client.post(
        "/tasks",
        json={"title": "Dev Task", "assignee_id": member_id, "status": "To Do", "priority": "Medium"},
    )
    task_id = res_t.json()["id"]
    assert res_t.json()["assignee_id"] == member_id

    del_res = client.delete(f"/members/{member_id}")
    assert del_res.status_code == 204

    assert client.get(f"/members/{member_id}").status_code == 404

    task_res = client.get(f"/tasks/{task_id}")
    assert task_res.status_code == 200
    assert task_res.json()["assignee_id"] is None
    assert task_res.json()["assignee"] is None
