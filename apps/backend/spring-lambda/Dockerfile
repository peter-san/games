
FROM amazoncorretto:17-alpine

ENV APP_HOME /usr/app
ENV APP_BIN $APP_HOME/app.jar
ENV APP_DATA_DIR $APP_HOME/data
ENV JAVA_OPTS "-ea"

RUN \
  addgroup --system app \
    && adduser --system app --ingroup app --home $APP_HOME --uid 1000

USER app

RUN \
  mkdir -pv $APP_DATA_DIR

EXPOSE 8080

WORKDIR $APP_DATA_DIR
VOLUME $APP_DATA_DIR

# set entry point
CMD java $JAVA_OPTS -jar $APP_BIN

COPY build/libs/app.jar $APP_BIN


# FROM gradle:7.4-jdk17-alpine AS java-builder
#
# COPY ./ ./project/
# WORKDIR ./project
#
# COPY *.gradle ./
# COPY src src
# RUN gradle bootJar --info --no-daemon
# FROM amazoncorretto:17
# COPY --from=java-builder /home/gradle/project/build/libs/*.jar /app/app.jar
# CMD java -jar /app/app.jar
# EXPOSE 8080
