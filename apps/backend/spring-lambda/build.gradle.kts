import com.github.jengelman.gradle.plugins.shadow.tasks.ShadowJar
import com.github.jengelman.gradle.plugins.shadow.transformers.PropertiesFileTransformer

plugins {
    id("org.springframework.boot") version "2.6.6"
    id("io.spring.dependency-management") version "1.0.11.RELEASE"
    kotlin("plugin.spring") version "1.6.21"

    id("com.github.johnrengelman.shadow") version "7.0.0"
}

val springCloudVersion = "3.2.6"
//val jacksonVersion = "2.13.4"
val awsLambdaJavaEventsVersion = "3.11.0"

dependencies {
    implementation(project(":core"))

    implementation("org.springframework.cloud:spring-cloud-starter-function-web:$springCloudVersion")
    implementation("org.springframework.cloud:spring-cloud-function-adapter-aws:$springCloudVersion")

    // implementation "com.amazonaws:aws-lambda-java-log4j2:$awsLambdaLog4jVersion"
    implementation("com.amazonaws:aws-lambda-java-events:$awsLambdaJavaEventsVersion")
    implementation("com.amazonaws:aws-lambda-java-serialization:1.0.0")
    implementation("com.amazonaws:aws-java-sdk-dynamodb:1.12.296")
    implementation("com.amazonaws:aws-java-sdk-eventbridge:1.12.300")
}

tasks{
    jar {
        manifest {
            attributes(mapOf("Start-Class" to "petersan.games.lambda.Application"))
        }
    }

    shadowJar {

        dependencies {
            exclude(
                dependency("org.springframework.cloud:spring-cloud-starter-function-web:${springCloudVersion}")
            )
        }

        mergeServiceFiles()

        append("META-INF/spring.handlers")
        append("META-INF/spring.schemas")
        append("META-INF/spring.tooling")

        transform( PropertiesFileTransformer().apply {
            paths = listOf("META-INF/spring.factories")
            mergeStrategy = "append"
        })
    }

    assemble {
        dependsOn(shadowJar)
    }
}
