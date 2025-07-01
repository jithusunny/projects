.PHONY: dev db backend frontend stop

dev: db backend frontend

db:
	docker compose -f backend/docker-compose.yml up -d db

backend:
	(cd backend && uvicorn app.main:app --reload &)

frontend:
	npm --prefix frontend run dev -- --port 5173 --strictPort --host & \
	sleep 2 && (xdg-open http://localhost:5173 >/dev/null 2>&1 || open http://localhost:5173)

stop:
	-pkill -f "uvicorn app.main" || true
	-pkill -f "vite" || true
