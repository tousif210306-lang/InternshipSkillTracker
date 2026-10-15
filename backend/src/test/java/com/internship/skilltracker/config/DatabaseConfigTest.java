package com.internship.skilltracker.config;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

public class DatabaseConfigTest {

    @Test
    public void testParseAivenServiceUri() {
        String serviceUri = "mysql://sampleuser:samplepass123@mysql-b45954-intershipskilltracker.c.aivencloud.com:25281/defaultdb?ssl-mode=REQUIRED";
        DatabaseConfig.ParsedDbConfig config = DatabaseConfig.parse(serviceUri, "", "");

        assertEquals("sampleuser", config.username);
        assertEquals("samplepass123", config.password);
        assertTrue(config.jdbcUrl.startsWith("jdbc:mysql://mysql-b45954-intershipskilltracker.c.aivencloud.com:25281/defaultdb"));
        assertTrue(config.jdbcUrl.contains("sslMode=REQUIRED"));
        assertTrue(config.jdbcUrl.contains("allowPublicKeyRetrieval=true"));
    }

    @Test
    public void testParseJdbcUrl() {
        String jdbc = "jdbc:mysql://mysql-b45954-intershipskilltracker.c.aivencloud.com:25281/defaultdb?ssl-mode=REQUIRED";
        DatabaseConfig.ParsedDbConfig config = DatabaseConfig.parse(jdbc, "customUser", "customPass");

        assertEquals("customUser", config.username);
        assertEquals("customPass", config.password);
        assertTrue(config.jdbcUrl.contains("sslMode=REQUIRED"));
        assertTrue(config.jdbcUrl.contains("allowPublicKeyRetrieval=true"));
    }

    @Test
    public void testFallbackWhenEmpty() {
        DatabaseConfig.ParsedDbConfig config = DatabaseConfig.parse("", "", "");

        assertEquals("avnadmin", config.username);
        assertTrue(config.jdbcUrl.contains("defaultdb"));
        assertTrue(config.jdbcUrl.contains("sslMode=REQUIRED"));
    }
}
