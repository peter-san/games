import org.jetbrains.kotlin.gradle.tasks.KotlinCompile

plugins {
    kotlin("jvm") version "1.7.10"
}

group = "petersan.games"

repositories {
     jcenter()
    mavenCentral()
    //maven { url = uri("https://maven.pkg.jetbrains.space/public/p/kotlinx-html/maven") }
}

subprojects {
    apply(plugin = "org.jetbrains.kotlin.jvm")

    repositories {
        jcenter()
        mavenCentral()
    }

    dependencies {
        testCompileOnly("org.junit.jupiter:junit-jupiter-api:5.9.0")
        testRuntimeOnly("org.junit.jupiter:junit-jupiter-engine:5.9.0")
    }

    tasks.test {
        useJUnitPlatform()
    }

    tasks.withType<KotlinCompile>() {
        kotlinOptions {
            freeCompilerArgs = listOf("-Xjsr305=strict")
            jvmTarget = "11"
        }
    }
}




