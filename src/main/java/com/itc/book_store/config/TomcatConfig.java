package com.itc.book_store.config;
import org.apache.catalina.connector.Connector;
import org.apache.coyote.http11.Http11NioProtocol;
import org.springframework.boot.web.embedded.tomcat.TomcatServletWebServerFactory;
import org.springframework.boot.web.server.WebServerFactoryCustomizer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.stereotype.Component;

@Configuration
public class TomcatConfig implements WebServerFactoryCustomizer<TomcatServletWebServerFactory> {

    @Override
    public void customize(TomcatServletWebServerFactory factory) {
        factory.addConnectorCustomizers(connector -> {
            // Configure the Tomcat connector for file uploads
            // Allow relaxed query characters
            connector.setProperty("maxHttpHeaderSize", "100000"); //   for HTTP headers
            connector.setMaxPostSize(524288000); // 500MB
            connector.setMaxParameterCount(100000); // ✅ increase form parameter count

            if (connector.getProtocolHandler() instanceof Http11NioProtocol protocol) {
                protocol.setMaxHttpHeaderSize(65536); // 64KB
                protocol.setMaxSwallowSize(-1);       // Unlimited
            }
        });
    }
}