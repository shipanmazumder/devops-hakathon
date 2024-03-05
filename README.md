# DevOps Hackathon Project with Opentelemetry Tracing

Welcome to the DevOps Hackathon project repository. This project aims to showcase a set of microservices implemented in Node.js and integrated with OpenTelemetry for observability and tracing.

## Microservices Overview

1. **User:**
   - Technologies: Node.js, OpenTelemetry, RabitMQ
   - Setup instructions: See the `user` directory for more details.

2. **Backend:**
   - Technologies: Node.js, OpenTelemetry, RabitMQ
   - Setup instructions: See the `backend` directory for more details.

3. **Feed:**
   - Technologies: Node.js, OpenTelemetry, Mongodb, Redis
   - Setup instructions: See the `mongodb` directory for more details.
3. **User History:**
   - Technologies: Node.js, OpenTelemetry, Mysql
   - Setup instructions: See the `mysql` directory for more details.

## Getting Started

Follow the instructions below to set up and run the microservices on your local machine.

### Prerequisites

- Node.js
- npm 
- Docker 

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/shipanmazumder/devops-hakathon.git
   cd devops-hakathon
   docker compose up -d
