FROM mcr.microsoft.com/playwright:v1.59.1-noble

WORKDIR /project

# Install dependencies
RUN apt-get update && \
    apt-get install -y make && \
    rm -rf /var/lib/apt/lists/*

# Copy project files
COPY . .

# Install npm dependencies
RUN cd frontend && npm install

# Run tests
CMD ["make", "test"]
