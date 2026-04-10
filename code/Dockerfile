FROM mcr.microsoft.com/playwright:v1.59.1-noble

WORKDIR /project

RUN apt-get update && \
    apt-get install -y make python3 python3-pip && \
    rm -rf /var/lib/apt/lists/*

COPY . .

RUN ls -la

CMD ["make", "test"]
