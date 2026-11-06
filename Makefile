.PHONY: init up down logs ps migrate api admin test lint

COMPOSE = docker compose --env-file .env -f infra/docker-compose.yml

init:            ## Abuur .env oo leh sirro random ah (haddii aanu jirin)
	@sh scripts/init-env.sh

up: init         ## Kici Postgres+PostGIS, Redis, MinIO (localhost kaliya)
	$(COMPOSE) up -d --wait

down:            ## Jooji adeegyada (xogta way hadhaysaa)
	$(COMPOSE) down

logs:
	$(COMPOSE) logs -f --tail=100

ps:
	$(COMPOSE) ps

migrate:         ## Ku dar migrations-ka database-ka
	cd apps/api && npm run migrate

api:             ## API dev server (http://localhost:3000/api/docs)
	cd apps/api && npm run start:dev

admin:           ## Admin dev server (http://localhost:3001)
	cd apps/admin && npm run dev

test:            ## Tijaabooyinka API + Admin build
	cd apps/api && npm test && npm run test:e2e -- --runInBand
	cd apps/admin && npm run build

lint:
	cd apps/api && npm run lint
	cd apps/admin && npm run lint
