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
  
## Tracing Examples

Here are examples of tracing generated by OpenTelemetry in this project:

![Tracing Example 2](https://i.imgur.com/xU3vPSV.png)

![Tracing Example 1](https://i.imgur.com/LnFHUvp.png)

## System Architecture Diagram

Below is an architecture diagram illustrating the overall structure of the this project:

![System Architecture Diagram](https://i.imgur.com/8chRJcc.png)

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
