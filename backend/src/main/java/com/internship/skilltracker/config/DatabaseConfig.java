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
import java.io.File;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.net.URI;
import java.security.KeyStore;
import java.security.cert.Certificate;
import java.security.cert.CertificateFactory;

@Configuration
@Profile("prod")
public class DatabaseConfig {

    private static final Logger logger = LoggerFactory.getLogger(DatabaseConfig.class);

    @Value("${spring.datasource.url:${DB_URL:${DATABASE_URL:}}}")
    private String rawUrl;

    @Value("${spring.datasource.username:${DB_USERNAME:}}")
    private String rawUsername;

    @Value("${spring.datasource.password:${DB_PASSWORD:}}")
    private String rawPassword;

    @Bean
    @Primary
    public DataSource dataSource() {
        ParsedDbConfig config = parse(rawUrl, rawUsername, rawPassword);
        logger.info("Initializing Production DataSource for user: '{}' (pass length: {}), JDBC URL: {}",
                config.username, config.password != null ? config.password.length() : 0, maskUrl(config.jdbcUrl));

        if (config.password == null || config.password.isBlank()) {
            logger.warn("CRITICAL: Database password is EMPTY. Set DB_PASSWORD in Render or provide it in the Service URI.");
        }

        HikariConfig hikariConfig = new HikariConfig();
        configureTruststoreIfAvailable(hikariConfig, config.jdbcUrl);
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

    private void configureTruststoreIfAvailable(HikariConfig hikariConfig, String jdbcUrl) {
        try (InputStream is = getClass().getResourceAsStream("/aiven-ca.pem")) {
            if (is != null) {
                CertificateFactory cf = CertificateFactory.getInstance("X.509");
                Certificate cert = cf.generateCertificate(is);
                KeyStore ks = KeyStore.getInstance("PKCS12");
                char[] password = "changeit".toCharArray();
                ks.load(null, password);
                ks.setCertificateEntry("aiven-ca", cert);

                File tempKs = File.createTempFile("aiven-truststore", ".p12");
                tempKs.deleteOnExit();
                try (FileOutputStream fos = new FileOutputStream(tempKs)) {
                    ks.store(fos, password);
                }

                String truststoreUrl = tempKs.toURI().toURL().toString();
                String sep = jdbcUrl.contains("?") ? "&" : "?";
                String enhancedUrl = jdbcUrl + sep
                        + "trustCertificateKeyStoreUrl=" + truststoreUrl
                        + "&trustCertificateKeyStoreType=PKCS12"
                        + "&trustCertificateKeyStorePassword=changeit";
                hikariConfig.setJdbcUrl(enhancedUrl);
                logger.info("Configured bundled Aiven CA truststore into JDBC URL successfully.");
                return;
            }
        } catch (Exception e) {
            logger.warn("Could not configure Aiven CA truststore: {}", e.getMessage());
        }
        hikariConfig.setJdbcUrl(jdbcUrl);
    }

    public static ParsedDbConfig parse(String rawUrl, String defaultUser, String defaultPassword) {
        String defaultAivenHost = "mysql-b45954-intershipskilltracker.c.aivencloud.com";
        int defaultAivenPort = 25281;
        String defaultAivenDb = "defaultdb";
        String fallbackUser = "avnadmin";

        if (rawUrl == null || rawUrl.isBlank()) {
            String user = (defaultUser != null && !defaultUser.isBlank()) ? defaultUser.trim() : fallbackUser;
            String pass = (defaultPassword != null && !defaultPassword.isBlank()) ? defaultPassword.trim() : "";
            String jdbcUrl = "jdbc:mysql://" + defaultAivenHost + ":" + defaultAivenPort + "/" + defaultAivenDb
                    + "?sslMode=REQUIRED&allowPublicKeyRetrieval=true";
            return new ParsedDbConfig(jdbcUrl, user, pass);
        }

        String trimmed = rawUrl.trim();
        // Support Aiven Service URI format: mysql://user:pass@host:port/db?ssl-mode=REQUIRED
        if (trimmed.startsWith("mysql://")) {
            try {
                URI uri = new URI(trimmed.replace("mysql://", "http://"));
                String user = null;
                String pass = null;

                if (uri.getUserInfo() != null && !uri.getUserInfo().isBlank()) {
                    String[] parts = uri.getUserInfo().split(":", 2);
                    user = parts[0];
                    if (parts.length > 1) {
                        pass = parts[1];
                    }
                }
                if (user == null || user.isBlank()) {
                    user = (defaultUser != null && !defaultUser.isBlank()) ? defaultUser.trim() : fallbackUser;
                }
                if (pass == null || pass.isBlank()) {
                    pass = (defaultPassword != null && !defaultPassword.isBlank()) ? defaultPassword.trim() : "";
                }

                String host = uri.getHost() != null ? uri.getHost() : defaultAivenHost;
                int port = uri.getPort() > 0 ? uri.getPort() : defaultAivenPort;
                String path = uri.getPath() != null && !uri.getPath().isBlank() && !uri.getPath().equals("/")
                        ? uri.getPath() : "/" + defaultAivenDb;

                String query = uri.getQuery();
                if (query != null && !query.isBlank()) {
                    query = query.replace("ssl-mode=", "sslMode=");
                } else {
                    query = "sslMode=REQUIRED";
                }
                if (!query.contains("allowPublicKeyRetrieval")) {
                    query += "&allowPublicKeyRetrieval=true";
                }

                String jdbcUrl = "jdbc:mysql://" + host + ":" + port + path + "?" + query;
                return new ParsedDbConfig(jdbcUrl, user, pass);
            } catch (Exception e) {
                logger.warn("Could not parse Service URI: {}, falling back to default", e.getMessage());
            }
        }

        // Support standard JDBC MySQL URL
        if (trimmed.startsWith("jdbc:mysql://")) {
            String jdbcUrl = trimmed.replace("ssl-mode=", "sslMode=");
            if (!jdbcUrl.contains("sslMode")) {
                jdbcUrl += (jdbcUrl.contains("?") ? "&" : "?") + "sslMode=REQUIRED";
            }
            if (!jdbcUrl.contains("allowPublicKeyRetrieval")) {
                jdbcUrl += "&allowPublicKeyRetrieval=true";
            }
            String user = (defaultUser != null && !defaultUser.isBlank()) ? defaultUser.trim() : fallbackUser;
            String pass = (defaultPassword != null && !defaultPassword.isBlank()) ? defaultPassword.trim() : "";
            return new ParsedDbConfig(jdbcUrl, user, pass);
        }

        // Fallback
        String user = (defaultUser != null && !defaultUser.isBlank()) ? defaultUser.trim() : fallbackUser;
        String pass = (defaultPassword != null && !defaultPassword.isBlank()) ? defaultPassword.trim() : "";
        return new ParsedDbConfig(trimmed, user, pass);
    }

    private static String maskUrl(String url) {
        if (url == null) return "null";
        return url.replaceAll(":[^/@]+@", ":****@");
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
