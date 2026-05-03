package com.prav.auth_service.dto;

import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import jakarta.validation.ValidatorFactory;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;

public class AuthRequestValidationTest {

    private static Validator validator;

    @BeforeAll
    static void setup() {
        ValidatorFactory factory = Validation.buildDefaultValidatorFactory();
        validator = factory.getValidator();
    }

    @Test
    void testValidRequest_NoViolations() {
        AuthRequest req = new AuthRequest();
        req.setUsername("testuser");
        req.setPassword("password123");

        Set<ConstraintViolation<AuthRequest>> violations = validator.validate(req);
        assertTrue(violations.isEmpty());
    }

    @Test
    void testBlankUsername_OneViolation() {
        AuthRequest req = new AuthRequest();
        req.setUsername("");
        req.setPassword("password123");

        Set<ConstraintViolation<AuthRequest>> violations = validator.validate(req);
        assertEquals(1, violations.size());
        assertEquals("Username is required", violations.iterator().next().getMessage());
    }

    @Test
    void testShortPassword_OneViolation() {
        AuthRequest req = new AuthRequest();
        req.setUsername("testuser");
        req.setPassword("12");

        Set<ConstraintViolation<AuthRequest>> violations = validator.validate(req);
        assertEquals(1, violations.size());
        assertEquals("Password must be 6-100 characters", violations.iterator().next().getMessage());
    }

    @Test
    void testBothInvalid_TwoViolations() {
        AuthRequest req = new AuthRequest();
        req.setUsername("");
        req.setPassword("");

        Set<ConstraintViolation<AuthRequest>> violations = validator.validate(req);
        assertEquals(2, violations.size());
    }
}