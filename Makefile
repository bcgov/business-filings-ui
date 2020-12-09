.PHONY: setup
.PHONY: ci cd

PROJECT_NAME=business-filings

#################################################################################
# COMMANDS -- Setup                                                             #
#################################################################################
setup: ## Clean and Install npm dependencies
	npm ci

#################################################################################
# COMMANDS - CI                                                                 #
#################################################################################
ci: lint test

lint:  ## Run linting ofcode.
	npm run lint

test:  ## Unit testing
	npm run test:unit

#################################################################################
# COMMANDS - CD                                                                 #
#################################################################################
cd: build

local-build: ## NPM build
	npm run build

build: ## Build the docker container
	docker build -t $(PROJECT_NAME) .

build-nc: ## Build the docker container without caching
	docker build --no-cache -t $(PROJECT_NAME) .

#################################################################################
# Self Documenting Commands                                                     #
#################################################################################
.PHONY: help

.DEFAULT_GOAL := help

help:
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'
