#!/usr/bin/env bash
docker buildx build --platform linux/amd64 -t lifting-buddy --load .

docker tag lifting-buddy:latest 975050027353.dkr.ecr.us-east-1.amazonaws.com/lifting-buddy:latest

docker push 975050027353.dkr.ecr.us-east-1.amazonaws.com/lifting-buddy:latest
