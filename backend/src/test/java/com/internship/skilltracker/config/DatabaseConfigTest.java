package com.internship.skilltracker.config;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

public class DatabaseConfigTest {

    @Test
    public void testParseJdbcUrl() {
        String jdbc = "jdbc:mysql://mysql-test.aivencloud.com:25281/defaultdb?ssl-mode=REQUIRED";
        DatabaseConfig.ParsedDbConfig config = DatabaseConfig.parse(jdbc, "avnadmin", "test-only-password");

        assertEquals("avnadmin", config.username);
        assertEquals("test-only-password", config.password);
        assertTrue(config.jdbcUrl.contains("sslMode=REQUIRED"));
        assertTrue(config.jdbcUrl.contains("allowPublicKeyRetrieval=true"));
    }

    @Test
    public void testParseAivenServiceUriWithCredentials() {
        String uri = "mysql://sampleuser:samplepass@mysql-test.aivencloud.com:25281/defaultdb?ssl-mode=REQUIRED";
        DatabaseConfig.ParsedDbConfig config = DatabaseConfig.parse(uri, "", "");

        assertEquals("sampleuser", config.username);
        assertEquals("samplepass", config.password);
        assertTrue(config.jdbcUrl.startsWith("jdbc:mysql://mysql-test.aivencloud.com:25281/defaultdb"));
        assertTrue(config.jdbcUrl.contains("sslMode=REQUIRED"));
    }

    @Test
    public void testRequiresTlsWhenMissingFromJdbcUrl() {
        DatabaseConfig.ParsedDbConfig config = DatabaseConfig.parse(
                "jdbc:mysql://mysql-test.aivencloud.com:25281/defaultdb", "avnadmin", "test-only-password");

        assertTrue(config.jdbcUrl.contains("sslMode=REQUIRED"));
    }

    @Test
    public void testFallbackWhenEmpty() {
        DatabaseConfig.ParsedDbConfig config = DatabaseConfig.parse("", "", "");

        assertEquals("avnadmin", config.username);
        assertTrue(config.jdbcUrl.contains("defaultdb"));
        assertTrue(config.jdbcUrl.contains("sslMode=REQUIRED"));
    }
}
