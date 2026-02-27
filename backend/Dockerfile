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
# Robustly parse DATABASE_URL for Neon/Render (handles query params, any format)
# Example: postgresql://user:password@host:port/database?params
ENTRYPOINT ["sh", "-c", "\
  DB_URL=\"$DATABASE_URL\"; \
  DB_USER=$(echo $DB_URL | awk -F[/:@] '{print $4}'); \
  DB_PASS=$(echo $DB_URL | awk -F[/:@] '{print $5}'); \
  DB_HOST=$(echo $DB_URL | awk -F[/:@] '{print $6}'); \
  DB_PORT_DB=$(echo $DB_URL | awk -F[/:@] '{print $7}'); \
  DB_DB=$(echo $DB_PORT_DB | awk -F'[/?]' '{print $1}'); \
  DB_PARAMS=$(echo $DB_URL | grep -o '\?.*' || echo ''); \
  JDBC_URL=\"jdbc:postgresql://${DB_HOST}/${DB_DB}${DB_PARAMS}\"; \
  echo \"Connecting to database at: ${DB_HOST}/${DB_DB}${DB_PARAMS}\"; \
  java -Dspring.profiles.active=production \
       -Dspring.datasource.url=\"$JDBC_URL\" \
       -Dspring.datasource.username=\"$DB_USER\" \
       -Dspring.datasource.password=\"$DB_PASS\" \
       -jar app.jar \
"]
