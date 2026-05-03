package com.prav.order.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Data
@Component
@ConfigurationProperties(prefix = "payment")
public class PaymentConfig {

    private String mode = "dummy"; // dummy or razorpay

    private Razorpay razorpay = new Razorpay();

    @Data
    public static class Razorpay {
        private String keyId;
        private String keySecret;
        private String currency = "INR";
    }

    public boolean isDummyMode() {
        return "dummy".equalsIgnoreCase(mode);
    }

    public boolean isRazorpayMode() {
        return "razorpay".equalsIgnoreCase(mode);
    }
}