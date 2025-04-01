#!/usr/bin/env bash
awsv2 ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin 975050027353.dkr.ecr.us-east-1.amazonaws.com

docker buildx build --platform linux/amd64 -t lifting-buddy --load .

docker tag lifting-buddy:latest 975050027353.dkr.ecr.us-east-1.amazonaws.com/lifting-buddy:latest

docker push 975050027353.dkr.ecr.us-east-1.amazonaws.com/lifting-buddy:latest
