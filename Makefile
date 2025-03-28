.DEFAULT_GOAL := push

# Default commit message
MSG ?= Update project

push:
	@git add .
	@if git diff-index --quiet HEAD --; then \
		echo "Nothing to commit."; \
	else \
		git commit -m "$(MSG)"; \
		git push origin main; \
	fi

status:
	@git status

pull:
	@git pull origin main

log:
	@git log --oneline --graph --decorate --all

# Allow custom commit messages
commit:
	@git add .
	@if git diff-index --quiet HEAD --; then \
		echo "Nothing to commit."; \
	else \
		git commit -m "$(MSG)"; \
	fi

.PHONY: push status pull log commit