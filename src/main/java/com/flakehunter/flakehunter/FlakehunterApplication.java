package com.flakehunter.flakehunter;

import java.util.TimeZone;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class FlakehunterApplication {

    public static void main(String[] args) {
        // PostgreSQL 16 doesn't recognise the old name "Asia/Calcutta"
        TimeZone.setDefault(TimeZone.getTimeZone("Asia/Kolkata"));
        SpringApplication.run(FlakehunterApplication.class, args);
    }
}