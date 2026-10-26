# Stage 1: Build com Maven e OpenJDK 17
FROM maven:3.9.6-eclipse-temurin-17-alpine AS build
WORKDIR /app

# Cache de dependências
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Compilação da aplicação
COPY src ./src
RUN mvn clean package -DskipTests

# Stage 2: Runtime leve com Alpine e JRE 17
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

# Cria diretórios de persistência de uploads
RUN mkdir -p /app/uploads/photos /app/uploads/thumbs

# Copia o JAR compilado
COPY --from=build /app/target/minha-turminha-api-*.jar app.jar

ENV PORT=8080
ENV UPLOAD_DIR=/app/uploads

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
