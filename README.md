# Node.js CRUD API

A small task API built with Express, plus a plain HTML and JavaScript front end
that talks to it. Written to practise the full set of CRUD routes end to end.

Tasks are held in memory, so the list resets every time the server restarts.
That is deliberate: the point here is the routing and the request handling, not
persistence.

## Running it

    npm install
    npm run dev

Then open http://localhost:3000 for the front end, or call the API directly.
Set `PORT` to use a different port.

## Endpoints

| Method | Path | What it does |
|---|---|---|
| GET | `/api` | lists the available endpoints |
| GET | `/tasks` | every task |
| GET | `/tasks/:id` | one task |
| POST | `/tasks` | create a task |
| PUT | `/tasks/:id` | update a task |
| DELETE | `/tasks/:id` | remove a task |

## A task

```json
{
  "id": 1,
  "title": "Learn Express basics",
  "description": "Create a simple CRUD API",
  "status": "pending",
  "createdAt": "2025-12-16T00:00:00.000Z",
  "updatedAt": "2025-12-16T00:00:00.000Z"
}
```

## Trying it

    curl http://localhost:3000/tasks
    curl -X POST http://localhost:3000/tasks -H "Content-Type: application/json" -d '{"title":"Write tests","description":"Cover the error paths"}'
    curl -X PUT http://localhost:3000/tasks/1 -H "Content-Type: application/json" -d '{"status":"done"}'
    curl -X DELETE http://localhost:3000/tasks/1

## Layout

    index.js       the server and all routes
    public/        the front end: index.html, app.js, style.css
