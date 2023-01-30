ifndef VERBOSE
.SILENT:
endif

DOCKER_USERNAME ?= jpcordeiro
APPLICATION_RELEASE ?= latest
APPLICATION_GET ?= boiler-get

info:
	printf "\033c"
	echo 
	echo " \033[0;32mBoiler consumption\033[0m"
	echo 
	echo "Usage" 
	echo "	make \033[0;33mbuild_get\033[0m	Build docker image ${DOCKER_USERNAME}/${APPLICATION_GET}:${APPLICATION_RELEASE}"
	echo "	make \033[0;33mpush_get\033[0m 	Push docker image ${DOCKER_USERNAME}/${APPLICATION_GET}:${APPLICATION_RELEASE}"
	echo

build_get:
	docker build -f Dockerfile.GetConso --tag ${DOCKER_USERNAME}/${APPLICATION_GET}:${APPLICATION_RELEASE} .

push_get:
	docker login -u ${DOCKER_USERNAME}
	docker push ${DOCKER_USERNAME}/${APPLICATION_GET}:${APPLICATION_RELEASE}
