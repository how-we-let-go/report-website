.PHONY: build

build: 
	@yarn install
	@HUGO_BASEURL=$(HUGO_BASEURL) HUGO_ENV=$(HUGO_ENV) hugo
