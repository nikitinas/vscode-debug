package com.example.sample;

import java.time.Duration;
import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;

public class SampleTwo {
  private final Map<String, Instant> timers = new LinkedHashMap<>();

  public void start(String name) {
    timers.put(name, Instant.now());
  }

  public Duration stop(String name) {
    Instant startedAt = timers.remove(name);
    if (startedAt == null) {
      return Duration.ZERO;
    }
    return Duration.between(startedAt, Instant.now());
  }

  public String report() {
    StringBuilder builder = new StringBuilder("Timers:").append(System.lineSeparator());
    timers.forEach((timerName, startTime) -> builder
      .append(timerName)
      .append(" (running ")
      .append(Duration.between(startTime, Instant.now()).toMillis())
      .append(" ms)")
      .append(System.lineSeparator()));
    return builder.toString();
  }
}

