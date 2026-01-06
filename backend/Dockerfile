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
# Render format: postgresql://user:password@host/database
# JDBC format: jdbc:postgresql://host/database with separate user/password
ENTRYPOINT ["sh", "-c", "\
  DB_USER=$(echo $DATABASE_URL | sed -e 's|postgresql://||' -e 's|:.*||'); \
  DB_PASS=$(echo $DATABASE_URL | sed -e 's|postgresql://[^:]*:||' -e 's|@.*||'); \
  DB_HOST=$(echo $DATABASE_URL | sed -e 's|postgresql://[^@]*@||'); \
  JDBC_URL=\"jdbc:postgresql://${DB_HOST}\"; \
  java -Dspring.profiles.active=production \
       -Dspring.datasource.url=$JDBC_URL \
       -Dspring.datasource.username=$DB_USER \
       -Dspring.datasource.password=$DB_PASS \
       -jar app.jar \
"]
