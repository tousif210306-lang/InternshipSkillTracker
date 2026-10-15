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
    }

    @Test
    public void testRequiresTlsWhenMissingFromJdbcUrl() {
        DatabaseConfig.ParsedDbConfig config = DatabaseConfig.parse(
                "jdbc:mysql://mysql-test.aivencloud.com:25281/defaultdb", "avnadmin", "test-only-password");

        assertTrue(config.jdbcUrl.contains("sslMode=REQUIRED"));
    }

    @Test
    public void testRejectsAivenServiceUriWithEmbeddedCredentials() {
        assertThrows(IllegalArgumentException.class, () -> DatabaseConfig.parse(
                "mysql://user:password@mysql-test.aivencloud.com:25281/defaultdb?ssl-mode=REQUIRED",
                "avnadmin", "test-only-password"));
    }

    @Test
    public void testRejectsNonAivenHost() {
        assertThrows(IllegalArgumentException.class, () -> DatabaseConfig.parse(
                "jdbc:mysql://localhost:3306/defaultdb?sslMode=REQUIRED", "avnadmin", "test-only-password"));
    }

    @Test
    public void testRejectsMissingCredentials() {
        assertThrows(IllegalArgumentException.class, () -> DatabaseConfig.parse(
                "jdbc:mysql://mysql-test.aivencloud.com:25281/defaultdb?sslMode=REQUIRED", "", ""));
    }
}
