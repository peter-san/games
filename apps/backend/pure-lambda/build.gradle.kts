import com.github.jengelman.gradle.plugins.shadow.tasks.ShadowJar
import com.github.jengelman.gradle.plugins.shadow.transformers.PropertiesFileTransformer

plugins {
    id("com.github.johnrengelman.shadow") version "7.0.0"
}

dependencies {
    implementation(project(":core"))

    // implementation "com.amazonaws:aws-lambda-java-log4j2:$awsLambdaLog4jVersion"
    implementation("com.amazonaws:aws-lambda-java-events:3.11.0")
    implementation("com.amazonaws:aws-lambda-java-core:1.2.1")
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

        mergeServiceFiles()

        transform( PropertiesFileTransformer().apply {
            mergeStrategy = "append"
        })
    }

    assemble {
        dependsOn(shadowJar)
    }
}
