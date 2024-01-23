
# NestJS Blog App with PostgreSQL and Docker

This is a simple blog application built with NestJS, utilizing PostgreSQL as the database, and Docker/Docker Compose for easy development and deployment.

## Prerequisites

Make sure you have the following installed on your machine:

- [Docker](https://www.docker.com/get-started)
- [Docker Compose](https://docs.docker.com/compose/install/)
- [Node.js](https://nodejs.org/)
- [NestJS CLI](https://docs.nestjs.com/cli/overview)

## Getting Started

1. **Clone the repository:**

   ```bash
   git clone https://github.com/iahmedelbayaa/blog.git
   ```

2. **Navigate to the project directory:**

   ```bash
   cd blog
   ```

3. **Install dependencies:**

   ```bash
   npm install
   ```

4. **Set up environment variables:**

   Create a `.env` file in the root of the project and configure your environment variables:

   ```env
   DATABASE_URL=postgresql://postgres:password@localhost:5432/blogdb
   PORT=3000
   ```

   Adjust the values based on your preferences and configurations.

5. **Start the application:**

   ```bash
   npm run start:dev
   ```

   The NestJS app will be running at `http://localhost:3000`.

6. **Access the API documentation:**

   Open your browser and go to `http://localhost:3000/api/docs` to explore the Swagger documentation for the API.

## Using Docker and Docker Compose

1. **Build and start the Docker containers:**

   ```bash
   docker-compose up --build
   ```

2. **Access the API documentation:**

   Open your browser and go to `http://localhost:3000/api/docs` to explore the Swagger documentation for the API.

3. **Stop the Docker containers:**

   ```bash
   docker-compose down
   ```

## Contributing

Feel free to contribute to the project by opening issues or submitting pull requests. Your feedback and contributions are highly appreciated.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
