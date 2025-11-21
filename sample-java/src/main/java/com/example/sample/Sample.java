package com.example.sample;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

public class Sample {
  private final String name;
  private final List<Integer> values = new ArrayList<>();

  public Sample(String name) {
    this.name = name;
  }

  public void addValue(int value) {
    values.add(value);
  }

  public int sum() {
    int total = 0;
    for (int value : values) {
      total += value;
    }
    return total;
  }

  public String describe() {
    StringBuilder builder = new StringBuilder();
    builder.append("Sample(").append(name).append(")").append(System.lineSeparator());
    for (int i = 0; i < values.size(); i++) {
      builder.append("value[").append(i).append("]=").append(values.get(i)).append(System.lineSeparator());
    }
    return builder.toString();
  }

  private static class Greeter {
    private final Sample sample;

    private Greeter(Sample sample) {
      this.sample = sample;
    }

    String greet() {
      return "Hello " + sample.name.toUpperCase(Locale.ROOT);
    }
  }

  public static void main(String[] args) {
    Sample sample = new Sample("Semantic Tokens");
    sample.addValue(5);
    sample.addValue(8);
    sample.addValue(13);

    Greeter greeter = new Greeter(sample);
    System.out.println(greeter.greet());
    System.out.println("Sum=" + sample.sum());
    System.out.println(sample.describe());
  }
}

