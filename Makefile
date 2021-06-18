.PHONY: setup
.PHONY: ci cd

PROJECT_NAME=business-filings
DOCKER_NAME=business-filings

#################################################################################
# COMMANDS -- Setup
# expects the terminal to be openshift login
# expects export OPENSHIFT_REPOSITORY=""
#################################################################################
setup: ## Clean and Install npm dependencies
	npm ci

create-env: ## create the configration files from dev
	@oc get configmap $(DOCKER_NAME)-dev-ui-configuration  -n "$(OPENSHIFT_REPOSITORY)-dev" \
		-o json | jq -r '.data["configuration.json"]' > ./public/config/configuration.json.dev

#################################################################################
# COMMANDS - CI                                                                 #
#################################################################################
ci: lint test

lint:  ## Run linting ofcode.
	npm run lint

test:  ## Unit testing
	npm run test:unit

#################################################################################
# COMMANDS - CD
# expects the terminal to be openshift login
# expects export OPENSHIFT_DOCKER_REGISTRY=""
# expects export OPENSHIFT_SA_NAME="$(oc whoami)"
# expects export OPENSHIFT_SA_TOKEN="$(oc whoami -t)"
# expects export OPENSHIFT_REPOSITORY=""
# expects export TAG_NAME="dev/test"
# expects export OPS_REPOSITORY=""                                                        #
#################################################################################
cd: ## CD flow
ifeq ($(TAG_NAME), test)
cd: vault-env
	oc -n "$(OPENSHIFT_REPOSITORY)-tools" tag $(DOCKER_NAME):dev $(DOCKER_NAME):$(TAG_NAME)
else ifeq ($(TAG_NAME), prod)
cd: vault-env
	oc -n "$(OPENSHIFT_REPOSITORY)-tools" tag $(DOCKER_NAME):$(TAG_NAME) $(DOCKER_NAME):$(TAG_NAME)-$(shell date +%F)
	oc -n "$(OPENSHIFT_REPOSITORY)-tools" tag $(DOCKER_NAME):test $(DOCKER_NAME):$(TAG_NAME)
else
TAG_NAME=dev
cd: build vault-env tag
endif

local-build: ## NPM build
	npm run build

build: ## Build the docker container
	docker build . -t $(DOCKER_NAME) \
		--build-arg VCS_REF=$(shell git rev-parse --short HEAD) \
		--build-arg BUILD_DATE=$(shell date -u +"%Y-%m-%dT%H:%M:%SZ") \

build-nc: ## Build the docker container without caching
	docker build --no-cache -t $(DOCKER_NAME) .

REGISTRY_IMAGE=$(OPENSHIFT_DOCKER_REGISTRY)/$(OPENSHIFT_REPOSITORY)-tools/$(DOCKER_NAME)
push: #build ## Push the docker container to the registry & tag latest
	@echo "$(OPENSHIFT_SA_TOKEN)" | docker login $(OPENSHIFT_DOCKER_REGISTRY) -u $(OPENSHIFT_SA_NAME) --password-stdin ;\
    docker tag $(DOCKER_NAME) $(REGISTRY_IMAGE):latest ;\
    docker push $(REGISTRY_IMAGE):latest

VAULTS=`cat devops/vaults.json`
vault-env: ## Update env from 1pass
	oc -n "$(OPS_REPOSITORY)-$(TAG_NAME)" exec "dc/vault-service-$(TAG_NAME)" -- ./scripts/1pass.sh \
		-m "secret" \
		-e "$(TAG_NAME)" \
		-a "$(DOCKER_NAME)-$(TAG_NAME)" \
		-n "$(OPENSHIFT_REPOSITORY)-$(TAG_NAME)" \
		-v "$(VAULTS)" \
		-r "true" \
		-f "true"

tag: push ## tag image
	oc -n "$(OPENSHIFT_REPOSITORY)-tools" tag $(DOCKER_NAME):latest $(DOCKER_NAME):$(TAG_NAME)

#################################################################################
# Self Documenting Commands                                                     #
#################################################################################
.PHONY: help

.DEFAULT_GOAL := help

help:
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'
