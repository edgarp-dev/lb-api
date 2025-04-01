FROM public.ecr.aws/awsguru/aws-lambda-adapter:0.8.4 AS aws-lambda-adapter
FROM denoland/deno:bin-1.45.2 AS deno_bin
FROM debian:bookworm-20230703-slim AS deno_runtime

COPY --from=aws-lambda-adapter /lambda-adapter /opt/extensions/lambda-adapter
COPY --from=deno_bin /deno /usr/local/bin/deno

ENV PORT=8000
EXPOSE 8000
ENV DENO_DIR=/var/deno_dir
RUN mkdir -p ${DENO_DIR}

WORKDIR /var/task
COPY . .

RUN deno cache --config=deno.json ./src/app.ts

CMD ["deno", "run", \
    "--config=deno.json", \
    "--allow-env", \
    "--allow-net", \
    "--allow-read", \
    "./src/app.ts"]
