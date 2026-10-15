package com.internship.skilltracker.config;

import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.context.annotation.Profile;

import javax.sql.DataSource;
import java.net.URI;
import java.net.URISyntaxException;

@Configuration
@Profile("prod")
public class DatabaseConfig {

    private static final Logger logger = LoggerFactory.getLogger(DatabaseConfig.class);

    @Value("${spring.datasource.url:${DB_URL:}}")
    private String rawUrl;

    @Value("${spring.datasource.username:${DB_USERNAME:}}")
    private String rawUsername;

    @Value("${spring.datasource.password:${DB_PASSWORD:}}")
    private String rawPassword;

    @Bean
    @Primary
    public DataSource dataSource() {
        ParsedDbConfig config = parse(rawUrl, rawUsername, rawPassword);
        logger.info("Initializing production MySQL datasource with TLS enabled.");

        HikariConfig hikariConfig = new HikariConfig();
        hikariConfig.setJdbcUrl(config.jdbcUrl);
        hikariConfig.setUsername(config.username);
        hikariConfig.setPassword(config.password);
        hikariConfig.setDriverClassName("com.mysql.cj.jdbc.Driver");
        hikariConfig.setPoolName("SkillTrackerHikariPool");
        hikariConfig.setMaximumPoolSize(10);
        hikariConfig.setMinimumIdle(2);
        hikariConfig.setConnectionTimeout(30000);
        hikariConfig.setIdleTimeout(600000);
        hikariConfig.setMaxLifetime(1800000);

        return new HikariDataSource(hikariConfig);
    }

    public static ParsedDbConfig parse(String rawUrl, String defaultUser, String defaultPassword) {
        String jdbcUrl = rawUrl == null ? "" : rawUrl.trim();
        String username = defaultUser == null ? "" : defaultUser.trim();
        String password = defaultPassword == null ? "" : defaultPassword;

        if (jdbcUrl.isBlank()) {
            throw new IllegalArgumentException("DB_URL is required for the production database.");
        }
        if (!jdbcUrl.startsWith("jdbc:mysql://")) {
            throw new IllegalArgumentException("DB_URL must be a JDBC MySQL URL from Aiven.");
        }
        if (username.isBlank() || password.isBlank()) {
            throw new IllegalArgumentException("DB_USERNAME and DB_PASSWORD must be set separately from DB_URL.");
        }

        try {
            URI uri = new URI(jdbcUrl.substring("jdbc:".length()));
            if (uri.getHost() == null || uri.getHost().isBlank() || uri.getPort() < 1 || uri.getUserInfo() != null) {
                throw new IllegalArgumentException("DB_URL must contain a host and must not contain credentials.");
            }
            String host = uri.getHost().toLowerCase();
            if (!host.endsWith(".aivencloud.com")) {
                throw new IllegalArgumentException("DB_URL must use the Aiven MySQL host.");
            }
        } catch (URISyntaxException e) {
            throw new IllegalArgumentException("DB_URL is not a valid JDBC MySQL URL.");
        }

        String normalizedUrl = jdbcUrl.replace("ssl-mode=", "sslMode=");
        if (!normalizedUrl.toLowerCase().contains("sslmode=")) {
            normalizedUrl += (normalizedUrl.contains("?") ? "&" : "?") + "sslMode=REQUIRED";
        }
        if (!normalizedUrl.toLowerCase().contains("sslmode=required")
                && !normalizedUrl.toLowerCase().contains("sslmode=verify_ca")
                && !normalizedUrl.toLowerCase().contains("sslmode=verify_identity")) {
            throw new IllegalArgumentException("DB_URL must require TLS with sslMode=REQUIRED or stronger.");
        }
        return new ParsedDbConfig(normalizedUrl, username, password);
    }

    public static class ParsedDbConfig {
        public final String jdbcUrl;
        public final String username;
        public final String password;

        public ParsedDbConfig(String jdbcUrl, String username, String password) {
            this.jdbcUrl = jdbcUrl;
            this.username = username;
            this.password = password;
        }
    }
}
