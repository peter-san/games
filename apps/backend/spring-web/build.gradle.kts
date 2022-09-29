plugins {
    id("org.springframework.boot") version "2.6.6"
    id("io.spring.dependency-management") version "1.0.11.RELEASE"
    kotlin("plugin.spring") version "1.6.21"
//    kotlin("plugin.allopen") version "1.6.10"
    kotlin("plugin.serialization") version "1.6.10"
    application
}

dependencies {
    implementation(project(":core"))

    implementation("org.springframework.boot:spring-boot-starter-web")
    implementation("org.springframework.boot:spring-boot-starter-websocket")
    implementation("org.springframework.boot:spring-boot-starter-mustache")
    implementation("org.springframework.boot:spring-boot-starter-actuator")
    implementation("org.springframework.boot:spring-boot-starter-security")

    implementation("org.springframework.boot:spring-boot-starter-web")
    implementation("org.springframework.boot:spring-boot-starter-websocket")

    implementation("com.amazonaws:aws-java-sdk-dynamodb:1.12.296")
}

tasks.bootJar {
    archiveFileName.set("app.jar")
}