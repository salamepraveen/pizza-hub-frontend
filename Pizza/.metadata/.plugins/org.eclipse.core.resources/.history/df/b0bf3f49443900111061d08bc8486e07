package com.prav.auth_service.service;

import com.prav.auth_service.dto.AuthRequest;
import com.prav.auth_service.util.JwtUtil;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
public class auth_serviceTests {

    @Autowired
    private AuthService authService;

    @Autowired
    private JwtUtil jwtUtil;

    @MockBean
    private RestTemplate restTemplate;

    @Test
    void testSignup_WithInvalidData_ReturnsError() {
        AuthRequest req = new AuthRequest();
        req.setUsername("ab");      
        req.setPassword("123");    

        Exception exception = assertThrows(Exception.class, () -> {
            authService.signup(req);
        });

        assertNotNull(exception);
    }

    @Test
    void testJwtUtil_GeneratesAndValidatesToken() {
      
        com.prav.auth_service.dto.UserDTO user = new com.prav.auth_service.dto.UserDTO();
        user.setId(1L);
        user.setUsername("testuser");
        user.setRole("USER");
        user.setAssignedRestaurantId(1L);

        String token = jwtUtil.generateToken(user);

        assertNotNull(token);
        assertFalse(token.isEmpty());

   
        var claims = jwtUtil.validate(token);
        assertEquals("1", claims.getSubject());
        assertEquals("USER", claims.get("role", String.class));
    }

    @Test
    void testJwtUtil_InvalidToken_ThrowsException() {
        assertThrows(Exception.class, () -> {
            jwtUtil.validate("invalid.token.here");
        });
    }
}