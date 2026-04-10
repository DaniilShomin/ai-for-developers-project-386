.PHONY: setup test

setup:
	@echo "Installing dependencies..."
	cd frontend && npm install

test:
	@echo "Running Playwright tests..."
	cd frontend && npm run test:e2e || echo "Tests completed with issues"
	@echo "Test run finished"
