.DEFAULT_GOAL := push

# Default commit message (quoted properly)
COMMIT_MSG ?= Update project

push:
	@git add .
	@git commit -m "$(COMMIT_MSG)"
	@git push origin main

status:
	@git status

pull:
	@git pull origin main

log:
	@git log --oneline --graph --decorate --all

# Allow custom commit messages
commit:
	@git add .
	@git commit -m "$(COMMIT_MSG)"

.PHONY: push status pull log commit