# EventFlow Backend - Production Dockerfile
# ==========================================

# Build stage
FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN mvn clean package -DskipTests

# Runtime stage
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

# Copy the built JAR
COPY --from=build /app/target/*.jar app.jar

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=60s --retries=3 \
  CMD wget -q --spider http://localhost:8080/api/health || exit 1

# Run the application with production profile
# Parse DATABASE_URL and transform to JDBC format
# Supports both Render (postgres://) and Neon (postgresql://) formats
# Example: postgres://user:password@host:port/database?sslmode=require
ENTRYPOINT ["sh", "-c", "\
  DB_URL=$(echo $DATABASE_URL | sed 's|^postgres://|postgresql://|'); \
  DB_USER=$(echo $DB_URL | sed -n 's|^postgresql://\\([^:]*\\):.*|\\1|p'); \
  DB_PASS=$(echo $DB_URL | sed -n 's|^postgresql://[^:]*:\\([^@]*\\)@.*|\\1|p'); \
  DB_HOST_PORT_DB=$(echo $DB_URL | sed -n 's|^postgresql://[^@]*@\\([^?]*\\).*|\\1|p'); \
  DB_PARAMS=$(echo $DB_URL | grep -o '?.*' || echo ''); \
  JDBC_URL=\"jdbc:postgresql://${DB_HOST_PORT_DB}${DB_PARAMS}\"; \
  echo \"Connecting to database at: ${DB_HOST_PORT_DB}\"; \
  java -Dspring.profiles.active=production \
       -Dspring.datasource.url=\"$JDBC_URL\" \
       -Dspring.datasource.username=\"$DB_USER\" \
       -Dspring.datasource.password=\"$DB_PASS\" \
       -jar app.jar \
"]
