package com.prav.auth.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.prav.auth.dto.*;
import com.prav.auth.service.AuthService;
import com.prav.common.dto.ApiResponse;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/auth")
public class AuthController {

    @Autowired
    private AuthService service;

    // ==================== SIGNUP (OTP-based) ====================

    @PostMapping("/signup/request")
    public ResponseEntity<ApiResponse<Void>> requestSignupOtp(@Valid @RequestBody OtpRequestDTO req) {
        service.requestSignupOtp(req);
        return ResponseEntity.ok(
                ApiResponse.<Void>builder()
                        .success(true)
                        .message("OTP sent to your email. Please verify to complete signup.")
                        .build());
    }

    @PostMapping("/signup/verify")
    public ResponseEntity<ApiResponse<AuthResponse>> verifySignup(@Valid @RequestBody OtpVerifyDTO req) {
        AuthResponse response = service.verifySignupAndCreate(req);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.<AuthResponse>builder()
                        .success(true)
                        .message("Account created successfully")
                        .data(response)
                        .build());
    }

    // ==================== SIGNIN — Password ====================

    @PostMapping("/signin")
    public ResponseEntity<ApiResponse<AuthResponse>> signin(@Valid @RequestBody AuthRequest req) {
        AuthResponse response = service.signin(req);
        return ResponseEntity.ok(
                ApiResponse.<AuthResponse>builder()
                        .success(true)
                        .message("Signed in successfully")
                        .data(response)
                        .build());
    }

    // ==================== SIGNIN — OTP ====================

    @PostMapping("/signin/otp/request")
    public ResponseEntity<ApiResponse<Void>> requestLoginOtp(@Valid @RequestBody OtpLoginRequestDTO req) {
        service.requestLoginOtp(req);
        return ResponseEntity.ok(
                ApiResponse.<Void>builder()
                        .success(true)
                        .message("OTP sent to your registered email.")
                        .build());
    }

    @PostMapping("/signin/otp/verify")
    public ResponseEntity<ApiResponse<AuthResponse>> verifyLoginOtp(@Valid @RequestBody OtpVerifyDTO req) {
        AuthResponse response = service.verifyLoginOtp(req);
        return ResponseEntity.ok(
                ApiResponse.<AuthResponse>builder()
                        .success(true)
                        .message("Signed in successfully via OTP")
                        .data(response)
                        .build());
    }
}