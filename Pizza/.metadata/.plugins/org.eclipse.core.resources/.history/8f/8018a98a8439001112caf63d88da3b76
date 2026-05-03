package com.prav.auth.aspect;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Pointcut;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;
import org.springframework.web.multipart.MultipartFile;

import java.util.Arrays;
import java.util.HashMap;
import java.util.Map;

@Aspect
@Component
public class ApiLoggingAspect {

    private static final Logger log = LoggerFactory.getLogger(ApiLoggingAspect.class);
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Pointcut("within(@org.springframework.web.bind.annotation.RestController *)")
    public void controllerMethods() {}

    @Pointcut("within(@org.springframework.stereotype.Service *)")
    public void serviceMethods() {}

    @Pointcut("within(@org.springframework.stereotype.Repository *)")
    public void repositoryMethods() {}

    // ==================== CONTROLLER — Full HTTP Request/Response Logging ====================

    @Around("controllerMethods()")
    public Object logController(ProceedingJoinPoint joinPoint) throws Throwable {
        String className = joinPoint.getTarget().getClass().getSimpleName();
        String methodName = joinPoint.getSignature().getName();
        long startTime = System.currentTimeMillis();

        // Log incoming request
        ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
        if (attributes != null) {
            HttpServletRequest request = attributes.getRequest();
            String httpMethod = request.getMethod();
            String uri = request.getRequestURI();
            String clientIp = request.getRemoteAddr();

            System.out.println("\n" +
                "╔══════════════════════════════════════════════════════════════");
            System.out.println("  >> INCOMING REQUEST");
            System.out.println("  >> " + httpMethod + " " + uri);
            System.out.println("  >> Controller: " + className + "." + methodName + "()");
            System.out.println("  >> Client IP: " + clientIp);
            System.out.println("  >> Headers: " + getHeaders(request));

            // Log request body (skip file uploads)
            Object[] args = joinPoint.getArgs();
            for (Object arg : args) {
                if (!(arg instanceof HttpServletRequest) && !(arg instanceof HttpServletResponse)
                        && !(arg instanceof MultipartFile)) {
                    System.out.println("  >> Request Body: " + toJson(arg));
                }
            }
            System.out.println("╚══════════════════════════════════════════════════════════════");
        }

        try {
            Object result = joinPoint.proceed();
            long elapsed = System.currentTimeMillis() - startTime;

            System.out.println(
                "╔══════════════════════════════════════════════════════════════");
            System.out.println("  << RESPONSE [" + className + "." + methodName + "()]");
            System.out.println("  << Status: SUCCESS (" + elapsed + "ms)");
            System.out.println("  << Response Body: " + toJson(result));
            System.out.println("╚══════════════════════════════════════════════════════════════");

            return result;
        } catch (Throwable ex) {
            long elapsed = System.currentTimeMillis() - startTime;

            System.out.println(
                "╔══════════════════════════════════════════════════════════════");
            System.out.println("  !! ERROR [" + className + "." + methodName + "()]");
            System.out.println("  !! Exception: " + ex.getClass().getSimpleName());
            System.out.println("  !! Message: " + ex.getMessage());
            System.out.println("  !! Time: " + elapsed + "ms");
            System.out.println("╚══════════════════════════════════════════════════════════════");

            throw ex;
        }
    }

    // ==================== SERVICE — Method calls with args ====================

    @Around("serviceMethods()")
    public Object logService(ProceedingJoinPoint joinPoint) throws Throwable {
        String className = joinPoint.getTarget().getClass().getSimpleName();
        String methodName = joinPoint.getSignature().getName();
        String args = Arrays.toString(joinPoint.getArgs());

        System.out.println("  [SERVICE] -> " + className + "." + methodName + "(" + truncate(args, 200) + ")");

        long startTime = System.currentTimeMillis();
        try {
            Object result = joinPoint.proceed();
            long elapsed = System.currentTimeMillis() - startTime;

            System.out.println("  [SERVICE] <- " + className + "." + methodName + "() returned in " + elapsed + "ms");
            return result;
        } catch (Throwable ex) {
            long elapsed = System.currentTimeMillis() - startTime;
            System.out.println("  [SERVICE] !! " + className + "." + methodName + "() FAILED after " + elapsed + "ms: " + ex.getMessage());
            throw ex;
        }
    }

    // ==================== REPOSITORY — DB queries ====================

    @Around("repositoryMethods()")
    public Object logRepository(ProceedingJoinPoint joinPoint) throws Throwable {
        String className = joinPoint.getTarget().getClass().getSimpleName();
        String methodName = joinPoint.getSignature().getName();
        String args = Arrays.toString(joinPoint.getArgs());

        long startTime = System.currentTimeMillis();
        Object result = joinPoint.proceed();
        long elapsed = System.currentTimeMillis() - startTime;

        if (elapsed > 200) {
            System.out.println("  [DB-SLOW] " + className + "." + methodName + "(" + truncate(args, 100) + ") took " + elapsed + "ms");
        }

        return result;
    }

    // ==================== HELPERS ====================

    private String toJson(Object obj) {
        try {
            if (obj == null) return "null";
            String json = objectMapper.writerWithDefaultPrettyPrinter().writeValueAsString(obj);
            return truncate(json, 500);
        } catch (Exception e) {
            return obj.toString();
        }
    }

    private String truncate(String str, int maxLen) {
        if (str == null) return "null";
        return str.length() > maxLen ? str.substring(0, maxLen) + "...(truncated)" : str;
    }

    private Map<String, String> getHeaders(HttpServletRequest request) {
        Map<String, String> headers = new HashMap<>();
        java.util.Enumeration<String> headerNames = request.getHeaderNames();
        while (headerNames.hasMoreElements()) {
            String name = headerNames.nextElement();
            // Mask Authorization header
            if ("authorization".equalsIgnoreCase(name)) {
                headers.put(name, request.getHeader(name).substring(0, 15) + "...");
            } else {
                headers.put(name, request.getHeader(name));
            }
        }
        return headers;
    }
}