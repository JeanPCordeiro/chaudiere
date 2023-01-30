ifndef VERBOSE
.SILENT:
endif

export MASTER1 ?= vmi1053342.contaboserver.net
export DOMAIN ?= lean-sys.com

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

ssh_set:
	echo 'StrictHostKeyChecking no' > ~/.ssh/config
	rm -f ~/.ssh/known_hosts
	rm -f ~/.ssh/id_rsa*
	ls ~/.ssh/
	ssh-keygen -q -t rsa -N '' -f ~/.ssh/id_rsa
	ssh-copy-id root@${MASTER1}

ssh_test:
	ssh root@${MASTER1} uptime

k3s_config:
	rm -fr ~/.kube
	mkdir ~/.kube
	scp root@${MASTER1}:/etc/rancher/k3s/k3s.yaml ~/.kube/config
	sudo sed -i 's/127.0.0.1/${MASTER1}/g'  ~/.kube/config
	kubectl get nodes -o=wide


build_get:
	docker build -f Dockerfile.GetConso --tag ${DOCKER_USERNAME}/${APPLICATION_GET}:${APPLICATION_RELEASE} .

push_get:
	docker login -u ${DOCKER_USERNAME}
	docker push ${DOCKER_USERNAME}/${APPLICATION_GET}:${APPLICATION_RELEASE}
